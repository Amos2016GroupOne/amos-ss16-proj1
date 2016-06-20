# UI Tour

This document will discuss how to best implement a tour to show new users the features of
the given ionic app.



## Therefore the following plugins were tested:

- ui-tour: https://github.com/benmarch/angular-ui-tour
  - supports a very easy concept of tour generating:
    - directives with tourtip content and titles are given per tag to describe
- angular-tour: https://github.com/DaftMonk/angular-tour
  - tourtips are defined in extra html elements that are linked per id to the element
  they do describe. As directive definition of tourtips seems possible as well.
- ui-tour(official): https://github.com/angular-ui/ui-tour
  - seems extremely minimalistic and is therefore easily adjustable
  - is the only one that could be easily setup together with ionic
  - seems to be oldest and outdated


All frameworks are under MIT or simular license.



# Different Tabs, views dynamically generated.

What happens if the next ui step is on a different tab?
