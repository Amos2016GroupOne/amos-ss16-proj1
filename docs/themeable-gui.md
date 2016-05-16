# How to make the GUI themeable:

## Goals:
- use device OS' look'n'feel
- easy customizeable
- useable for elder people

## First idea: using the ionic materials theme
- http://ionicmaterial.com/
### Pros:
- should look nice on android
### Cons:
- seems to be not under development atm.
- still alpha --> turns out to be ugly looking / bad to integrate!
  - see branch `test-ionic-material`
  - e.g. materials theme app-header-bar not compatible with ion-nav-bar
- outdated
- what happens on ios?

## Second idea: ionic-materials-starter
- https://github.com/IonicMaterialDesign/ionic-material-starter
- turns out to be only the normal theme of ionic.


## Soooo: just use the standard theming and modify it a bit?
- componentwise styling (http://ionicframework.com/docs/platform-customization/)
- make use of sass (see `scss/ionic.app.scss`)

## How to style platform independent:
- `merges` directory is the cleanest way:
  - http://ionicframework.com/docs/platform-customization/dynamic-templates.html
- other ways proposed here:
  - http://ionicframework.com/docs/platform-customization/
