EIGENES 3D-AUTO EINBINDEN
=========================

Die Website lädt automatisch eine Datei namens  car.glb  aus diesem Ordner
(models/car.glb) und zeigt sie statt des prozeduralen Fallback-Autos an.
Sie wird automatisch zentriert, auf den Boden gestellt und passend skaliert.

SO GEHT'S
---------
1) Modell besorgen (z. B. den Mercedes-Benz E63 S von CGTrader).
   Hinweis: Lizenzbedingungen des Modells beachten (Royalty Free etc.).

2) In web-fertiges glTF/GLB umwandeln, falls es .obj/.fbx/.blend/.max ist:
   - Blender (kostenlos) öffnen  ->  File > Import  (dein Format)
   - dann  File > Export > glTF 2.0 (.glb)  ->  als car.glb speichern
   - Format "glTF Binary (.glb)" wählen, "Include > Materials" anhaken.

3) Optimieren (wichtig fürs Web – CGTrader-Modelle sind oft sehr schwer):
   Ziel: < ~5 MB, < ~150.000 Dreiecke. Mit Node:
     npx @gltf-transform/cli optimize roh.glb car.glb --texture-compress webp
   (DRACO- und Meshopt-komprimierte Dateien werden ebenfalls unterstützt.)

4) Die fertige Datei hierher legen:  models/car.glb
   Danach Seite neu laden – fertig.

FEINTUNING (optional)
---------------------
In  js/scene.js  ganz oben:
   MODEL_TARGET_LEN  = Gesamtgröße des Autos in der Szene (Standard 4.6)
   MODEL_ROTATION_Y  = Drehung in Radiant, falls das Auto falsch herum steht
                       (z. B. Math.PI für 180°)

Ohne car.glb wird automatisch das prozedurale Low-Poly-Auto angezeigt.
