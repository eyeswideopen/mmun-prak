# Einzelpraktikum Museum Mensch und Natur

- To setup the project first install node/npm (if you don't have it already) via https://nodejs.org/en/download/ or your favorite package manager
- install cordova: 
  open a console and type:
  npm install -g cordova
- install ionic:
  open a console and type:
  npm install -g cordova ionic
- then just navigate to the root project folder (where this readme is located) and run: ```npm install```
- this will install ionic and all dependencies
- to start the project navigate to the ionic project folder "praktikum_mediengestaltung"
- from here all ionic CLI commands are available (```ionic --help```is your friend)

Note: add ibeacon plugin manually as it cant be saved to plugin list (ionic bug for external plugins):
cordova plugin add https://github.com/petermetz/cordova-plugin-ibeacon.git
