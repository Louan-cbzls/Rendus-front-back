from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from uuid import uuid4

app = FastAPI()

# Autoriser les requêtes CORS depuis le frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # autoriser le client
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mémoire (état global du serveur)
grilles = {}  # grilles de pixels par mapid
users = {}    # associe une clé temporaire à un user_id
deltas = {}   # modifs en attente à envoyer aux utilisateurs

NX, NY = 100, 100  # Taille de la grille

# Crée une grille blanche nx×ny
def generate_empty_grid(nx, ny):
    return [[[255, 255, 255] for _ in range(nx)] for _ in range(ny)]

# Étape 1 : génère une clé temporaire côté client
@app.get("/api/v1/{mapid}/preinit")
async def preinit(mapid: str):
    key = str(uuid4())
    users[key] = None
    # Initialise la grille si elle n’existe pas encore
    if mapid not in grilles:
        grilles[mapid] = generate_empty_grid(NX, NY)
    return {"key": key}

# Étape 2 : associe un user_id à la clé et envoie la grille
@app.get("/api/v1/{mapid}/init")
async def init(mapid: str, key: str):
    user_id = str(uuid4())
    users[key] = user_id
    deltas[user_id] = []  # initialiser les modifs à recevoir
    grille = grilles[mapid]
    return {"id": user_id, "nx": NX, "ny": NY, "data": grille}

# Étape 3 : le client pose un pixel (si ID et map valides)
@app.get("/api/v1/{mapid}/set/{user_id}/{y}/{x}/{r}/{g}/{b}")
async def set_pixel(mapid: str, user_id: str, y: int, x: int, r: int, g: int, b: int):
    # Vérifie si la map ou le user est invalide
    if mapid not in grilles or user_id not in deltas:
        return JSONResponse(status_code=400, content={"error": "invalid request"})
    # Applique le changement localement
    grilles[mapid][y][x] = [r, g, b]
    # Enregistre le delta pour tous les autres utilisateurs
    for uid in deltas:
        if uid != user_id:
            deltas[uid].append([y, x, r, g, b])
    return 0  # succès

# Étape 4 : le client demande les modifs à appliquer
@app.get("/api/v1/{mapid}/deltas")
async def get_deltas(mapid: str, id: str):
    if id not in deltas:
        return {"deltas": []}
    result = deltas[id]  # récupère les nouvelles modifs
    deltas[id] = []      # réinitialise les modifs après envoi
    return {"deltas": result}