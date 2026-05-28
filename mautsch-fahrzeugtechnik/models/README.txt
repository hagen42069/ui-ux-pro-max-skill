3D-AUTO DER WEBSITE
===================

Die Seite lädt automatisch  models/car.glb  und zeigt es als Hero-Auto an
(automatisch zentriert, auf den Boden gestellt, passend skaliert).
Ist keine Datei vorhanden, wird das prozedurale Low-Poly-Auto angezeigt.

AKTUELLES MODELL (PLATZHALTER)
-----------------------------
car.glb ist aktuell ein Mercedes (G-Klasse / G63-Optik), web-optimiert:
  - Original ~22 MB  ->  ~2,8 MB
  - Geometrie DRACO-komprimiert, Texturen auf 1024px WebP reduziert
  - ~229.000 Dreiecke

WICHTIG – LIZENZ:
Das Modell stammt aus einem öffentlichen GitHub-Repo (Jazua6969/3d-showcase),
das KEINE Lizenzdatei enthält. Es dient hier nur als PLATZHALTER, damit du
ein echtes Mercedes-Modell siehst. Vor dem LIVE-Gang einer echten Kundenseite
unbedingt durch ein Modell mit geklärter Lizenz ersetzen (z. B. dein
gekauftes/lizensiertes CGTrader-Modell des E63 S).

EIGENES MODELL EINBINDEN (z. B. Mercedes E63 S)
----------------------------------------------
1) Modell besorgen (CGTrader, Sketchfab "Downloadable + glTF", o. ä.).
2) Falls .obj/.fbx/.blend/.max: in Blender öffnen und als glTF 2.0 (.glb)
   exportieren ("glTF Binary", Materialien einschließen).
3) Optimieren (Ziel < ~5 MB):
     npx @gltf-transform/cli optimize roh.glb car.glb --texture-compress webp
4) Datei hier als  models/car.glb  ablegen, Seite neu laden – fertig.

FEINTUNING (optional, in js/scene.js ganz oben)
-----------------------------------------------
   MODEL_TARGET_LEN  = Größe des Autos in der Szene (Standard 4.6)
   MODEL_ROTATION_Y  = Drehung in Radiant, falls das Auto falsch herum steht
