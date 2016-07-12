# How to write GUI themes

Have a look in the `themes/` folder! Every theme consists of two files:
  - the `.app-icon.svg`-file which specifies the theme's app icon
  - and the `.app.scss`-file which styles the app's controls.
On compiling the standard theme is selected when no other theme was chosen via `./selectTheme.sh`-script.
Icons in all sizes will be generated and the `.app.scss`-file is compiled into css.

__Hint:__ If you want to test while styling, use the `ionic serve` command! It will refresh the app preview in your browser as soon as you save the `.scss`-document.

In the scss file properties can be overwritten and colors can be easily changed with the given scss-variables.
