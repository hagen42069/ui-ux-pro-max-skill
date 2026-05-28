3D-AUTO DER WEBSITE
===================

Die Seite lädt automatisch  models/car.glb  und zeigt es als Hero-Auto an
(automatisch zentriert, auf den Boden gestellt, passend skaliert).
Ist keine Datei vorhanden, wird das prozedurale Low-Poly-Auto angezeigt.

AKTUELLES MODELL
----------------
car.glb ist der vom Nutzer bereitgestellte Mercedes-AMG GT
(aus sportcar.obj + sportcar.mtl + SportCarTextures), web-optimiert:
  - Lack auf GUNMETAL / GRAPHIT umgefärbt (#3a414e)
  - Felgen, Reifen, Carbon, Kühlergrill, Bremsen mit Original-Texturen
  - Texturen auf 1024px WebP, Geometrie DRACO-komprimiert
  - ~4,8 MB (mit Texturen)  ->  ~0,6 MB

LIZENZ: Quelle vom Nutzer geliefert – bitte vor dem Live-Gang sicherstellen,
dass die Nutzungsrechte für die Website geklärt sind.

LACKFARBE ÄNDERN: in js/scene.js gibt es dafür keinen Schalter, da die Farbe
im Modell steckt. Umfärben über das Re-Color-Skript (gltf-transform) oder
einfach Bescheid geben.

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
