// Liste de mots possibles
const motsPossibles = ["tasse", "chien", "pomme", "table", "livre", "plage"];

let motSecret;
let tentative = 0;
let motActuel = "";
const MAX_TENTATIVES = 6;

const grille = document.getElementById("grille");
const clavier = document.getElementById("clavier");
const message = document.getElementById("message");
const boutonRejouer = document.getElementById("rejouer");

function demarrerJeu() {
  // Réinitialise les variables et l'affichage
  motSecret = motsPossibles[Math.floor(Math.random() * motsPossibles.length)];
  tentative = 0;
  motActuel = "";
  grille.innerHTML = "";
  message.textContent = "";
  boutonRejouer.style.display = "none";

  // Création de la grille vide
  for (let i = 0; i < MAX_TENTATIVES * 5; i++) {
    const caseLettre = document.createElement("div");
    caseLettre.className = "case";
    grille.appendChild(caseLettre);
  }

  creerClavier();
}

function creerClavier() {
  clavier.innerHTML = "";
  const lettres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const lettre of lettres) {
    const bouton = document.createElement("button");
    bouton.textContent = lettre;
    bouton.className = "touche";
    bouton.onclick = () => ajouterLettre(lettre);
    clavier.appendChild(bouton);
  }

  // Ajout des touches spéciales
  const entrer = document.createElement("button");
  entrer.textContent = "↵";
  entrer.className = "touche";
  entrer.onclick = validerMot;
  clavier.appendChild(entrer);

  const effacer = document.createElement("button");
  effacer.textContent = "⌫";
  effacer.className = "touche";
  effacer.onclick = supprimerLettre;
  clavier.appendChild(effacer);
}

function ajouterLettre(lettre) {
  if (motActuel.length < 5) {
    motActuel += lettre;
    miseAJourAffichage();
  }
}

function supprimerLettre() {
  motActuel = motActuel.slice(0, -1);
  miseAJourAffichage();
}

function miseAJourAffichage() {
  for (let i = 0; i < 5; i++) {
    const index = tentative * 5 + i;
    const caseLettre = grille.children[index];
    caseLettre.textContent = motActuel[i] || "";
  }
}

function validerMot() {
  if (motActuel.length !== 5) return;

  const lettresUtilisees = {};
  for (let i = 0; i < 5; i++) {
    const index = tentative * 5 + i;
    const caseLettre = grille.children[index];
    const lettre = motActuel[i];

    caseLettre.classList.add("retournement");

    if (lettre === motSecret[i]) {
      caseLettre.classList.add("bien-place");
      lettresUtilisees[lettre] = "utilise-bien-place";
    } else if (motSecret.includes(lettre)) {
      caseLettre.classList.add("mal-place");
      if (lettresUtilisees[lettre] !== "utilise-bien-place")
        lettresUtilisees[lettre] = "utilise-mal-place";
    } else {
      caseLettre.classList.add("incorrect");
      if (!lettresUtilisees[lettre])
        lettresUtilisees[lettre] = "utilise-incorrect";
    }
  }

  // Mise à jour des touches du clavier selon résultat
  for (const bouton of clavier.children) {
    const lettre = bouton.textContent;
    if (lettresUtilisees[lettre]) {
      bouton.classList.remove("utilise-bien-place", "utilise-mal-place", "utilise-incorrect");
      bouton.classList.add(lettresUtilisees[lettre]);
    }
  }

  if (motActuel === motSecret) {
    message.textContent = "🎉 Bravo ! Vous avez trouvé le mot !";
    boutonRejouer.style.display = "inline-block";
    return;
  }

  tentative++;
  motActuel = "";

  if (tentative === MAX_TENTATIVES) {
    message.textContent = `💀 Perdu ! Le mot était : ${motSecret}`;
    boutonRejouer.style.display = "inline-block";
  }
}

demarrerJeu();