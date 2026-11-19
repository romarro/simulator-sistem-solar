# Univers în mișcare

Simulator demonstrativ pentru Fizică, clasa a VI-a: mișcare și repaus, traiectorie și alegerea reperului.

## Utilizare

Deschide `index.html` în browser. Tot ce este necesar rulării se află în acest director, inclusiv p5.js; nu este necesară conexiunea la internet, instalarea pachetelor sau pornirea unui server. Alege Soarele, Pământul, Marte sau Jupiter ca reper, apoi experimentează cu viteza, zoomul și urmele. Pauza oprește timpul, iar butonul de resetare îl readuce la zero.

Butonul **Ecran complet** afișează animația pe tot ecranul, iar comenzile apar într-un panou translucid care poate fi ascuns. Ieși cu butonul dedicat sau cu Escape. Dacă browserul nu permite ecranul complet, simularea umple fereastra disponibilă și afișează o notificare. Controlul **Lungimea urmei** ajustează durata reprezentată, în zile simulate; durata se împarte automat la factorul de zoom, astfel încât apropierea scurtează urma. Este o ajustare aproximativă a lungimii vizuale: forma și viteza relativă variază în timp, iar înainte de acumularea timpului simulat urma poate fi mai scurtă.

## Model

Pozițiile inițiale sunt arbitrare. Planetele se mișcă uniform pe cercuri coplanare, cu perioade aproximative preluate din [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/). Distanțele medii față de Soare sunt transformate prin rădăcină pătrată înainte de calculul pozițiilor relative, pentru a încăpea pe ecran: aceasta deformează distanțele și traiectoriile. Dimensiunile corpurilor sunt simbolice, iar Soarele este fix în modelul heliocentric. Simularea nu este o efemeridă și nu calculează interacțiunile gravitaționale.

Fiecare reper are originea pe corpul ales, cu axe paralele celor din sistemul heliocentric, fără rotație odată cu planeta. Urmele sunt calculate pentru momente trecute în același reper și se estompează treptat. Cercurile discrete sunt afișate doar în reperul Soarelui și reprezintă orbitele modelului heliocentric.

## Publicare pe GitHub Pages

Acest director este un repository Git independent, ignorat de repository-ul proiectului școlar. Workflow-ul `.github/workflows/pages.yml` publică rădăcina repository-ului simulatorului, fără materialele din proiectul părinte.

1. Creează pe GitHub un repository gol, de exemplu `simulator-sistem-solar`. Verifică toate fișierele urmărite înainte de a-l face public.
2. Din acest director, adaugă repository-ul GitHub ca `origin`, apoi trimite ramura `main`:

   ```powershell
   git remote add origin https://github.com/UTILIZATOR/simulator-sistem-solar.git
   git push -u origin main
   ```

   Înlocuiește `UTILIZATOR` cu numele contului GitHub. Nu crea un README sau alte fișiere în repository-ul GitHub gol înainte de primul push.
3. În GitHub, la **Settings → Pages → Build and deployment**, selectează **GitHub Actions**. Workflow-ul rulează la push pe `main` și poate fi pornit manual din fila Actions. După terminare, adresa este afișată în Settings → Pages.

Un site Pages este public. Repository-ul GitHub și publicarea trebuie configurate separat; crearea repository-ului local nu le realizează automat.

## Verificare

```powershell
node --test model.test.js
```

Verifică și în browser, inclusiv fără conexiune, schimbarea tuturor reperelor, pauza, resetarea, zoomul și urmele.

## Bibliotecă

[p5.js 1.11.11](https://github.com/processing/p5.js/tree/v1.11.11), distribuită local nemodificată în `vendor/p5.min.js`; licența și informațiile terților sunt în `vendor/p5-LICENSE.txt`. Codul-sursă al versiunii este disponibil la linkul de mai sus.
