# CSE-4204-Computer-Graphics-Project-A-Satalite-in-Orbit-
A webgl project wriiten in JavaScript , html, CSS . Figures  used in the project (That is earth, satellite , stars ..) are made with custom geometries .  It animates the satellite hovering the Earth .  The  project also has keyboard, mouse interaction .


# 🌍 WebGL Earth Project

This project renders an interactive Earth using **WebGL + Three.js**.  
The Earth texture is generated dynamically with an **HTML5 Canvas** (see `createEarthCanvasTexture()` in the code).

---

**## 🚀 Running the Project Locally**

Modern browsers block WebGL shader and texture requests when loaded directly from `file://`.  
To fix this, we serve the project through a **local server**.

### Option 1: Run with Python’s Built-in Server (Recommended)

1. Open a terminal (Command Prompt, PowerShell, or Terminal) inside the project folder:
   
   cd path/to/project


**Start a local server:**

For Python 3:

**COMMAND :** python -m http.server 8000 

Open your browser and go to:

**URL:**  http://localhost:8000/index.html
