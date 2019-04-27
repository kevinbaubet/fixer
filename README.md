# Documentation Fixer

Fixer permet de figer un élément en fonction du scroll.

* Compatibilité : IE11+
* Dépendance : jQuery

## Initialiser Fixer

    var fixer = $('#element').fixer([options]);
    
    
* @param *{object}* **options**  (optionnel) [Options](README.md#options)

        var fixer = $('#element').fixer({
            onFixed: function () {
                console.log('#element is fixed!');
            }
        });


## Options

| Option                            | Type     | Valeur par défaut    | Description                                                                                                                                                   |
|-----------------------------------|----------|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| container                         | object   | undefined            | Conteneur de l'élément à fixer. Si la valeur n'est pas définie, c'est le *body* qui sera utilisé                                                              |
| start                             | integer  | undefined            | Hauteur du scroll à partir duquel l'élément sera fixé à partir du conteneur. Si la valeur n'est pas définie, c'est la position haute de l'élément à fixer     |
| end                               | integer  | undefined            | Hauteur du scroll à partir duquel l'élément ne sera plus fixé. Si la valeur n'est pas définie, c'est la hauteur du conteneur - la position haute de l'élément |
| offset                            | integer  | 0                    | Décalage des limites pour fixer                                                                                                                               |
| reverse                           | boolean  | false                | Inverser le fonctionnenemnt pour fixer l'élément. Si true, il faudra remonter la page pour fixer l'élément                                                    |
| scrollEvent                       | boolean  | true                 | Activer/Désactiver l'événenement de scroll. Voir section *Événements personnalisés*                                                                           |
| resizeEvent                       | boolean  | false                | Activer/Désactiver l'événenement de resize. Voir section *Événements personnalisés*                                                                           |
| resizeTimeout                     | integer  | 100                  | Delai avant l'execution de l'événement resize, en ms                                                                                                          |
| autoLoad                          | boolean  | true                 | Éxecuter Fixer à l'événement *load*                                                                                                                           |
| autoDisable                       | boolean  | true                 | Désactive automatiquement Fixer si l'élément à fixer est plus haut que la fenêtre du navigateur                                                               |
| autoUpdate                        | boolean  | false                | Requis l'option *resizeEvent* à *true*. Met à jour les positions de départ/fin de Fixer lors de l'événement *resize*                                          |
| autoPadding                       | boolean  | false                | Permet de compenser le décalage du scroll dans le conteneur lorsque l'élément est fixé                                                                        |
| autoWidth                         | boolean  | false                | Permet de définir automatiquement la largeur de l'élément à fixer                                                                                             |
| autoPosition                      | boolean  | false                | Permet de définir automatiquement la position gauche de l'élément à fixer                                                                                     |
| classes                           | object   | Voir ci-dessous      | Liste les options ci-dessous                                                                                                                                  |
| &nbsp;&nbsp;&nbsp;&nbsp;prefix    | string   | 'fixer'              | Préfix de classe                                                                                                                                              |
| &nbsp;&nbsp;&nbsp;&nbsp;container | string   | '{prefix}-container' | Classe pour le conteneur de l'élement à fixer                                                                                                                 |
| &nbsp;&nbsp;&nbsp;&nbsp;element   | string   | '{prefix}-element'   | Classe pour l'élement à fixer                                                                                                                                 |
| &nbsp;&nbsp;&nbsp;&nbsp;input     | string   | 'is-input'           | Classe pour indiquer si on est en train de saisir un formulaire                                                                                               |
| &nbsp;&nbsp;&nbsp;&nbsp;fixed     | string   | 'is-fixed'           | Classe pour indiquer si l'élement est fixé                                                                                                                    |
| &nbsp;&nbsp;&nbsp;&nbsp;bottom    | string   | 'is-bottom'          | Classe pour indiquer si l'élement est arrivé en bas du conteneur                                                                                              |
| &nbsp;&nbsp;&nbsp;&nbsp;reset     | string   | 'is-reset'           | Classe pour indiquer si l'élement est revenu à la normale                                                                                                     |
| &nbsp;&nbsp;&nbsp;&nbsp;disabled  | string   | 'is-disabled'        | Classe pour indiquer si l'élement est désactivé                                                                                                               |
| afterEventsHandler                | function | undefined            | Callback après la déclaration des événements                                                                                                                  |
| onScroll                          | function | undefined            | Callback lors du scroll                                                                                                                                       |
| onResize                          | function | undefined            | Callback lors du resize                                                                                                                                       |
| onFixed                           | function | undefined            | Callback une fois l'élément fixé                                                                                                                              |
| onBottom                          | function | undefined            | Callback une fois l'élément arrivé en bas du conteneur                                                                                                        |
| onReset                           | function | undefined            | Callback une fois l'élément revenu à la normale                                                                                                               |
| onDisable                         | function | undefined            | Callback une fois l'élément désactivé                                                                                                                         |
| onChangeState                     | function | undefined            | Callback à chaque changement d'état (default, fixed, bottom)                                                                                                  |


## API

#### setContainer()

Définition du conteneur courant

* @param *{object}* **container** jQuery object

        fixer.setContainer($('#container'));

#### getContainer()

Récupération du conteneur courant

* @return *{object}*

#### setFixer()

Définition de l'élement à fixer

* @param *{object}* **element** jQuery object

        fixer.setFixer($('#element'));

#### getFixer()

Récupération l'élément à fixer

* @return *{object}*

#### setStart()

Définition de la position de départ

* @param *{int}* **position** Position

        fixer.setStart(300);

#### getStart()

Récupération de la position de départ

* @return *{int}*

#### setEnd()

Définition de la position de fin

* @param *{int}* **position** Position
* @param *{boolean=true}* **addStart** Ajouter la position de départ

        fixer.setEnd(1000);

#### getEnd()

Récupération de la position de fin

* @return *{int}*

#### setHeight()

Définition de la hauteur de l'élément fixé

#### getHeight()

Récupération de la hauteur de l'élément fixé

* @return *{number}*

#### setWidth()

Définition de la largeur de l'élément fixé

#### getWidth()

Récupération de la largeur de l'élément fixé

* @return *{number}*

#### setPosition()

Définition de la position de l'élément fixé

#### getPosition()

Récupération de la position de l'élément fixé

* @return *{number}*

#### setWindowSize()

Définition de la taille de la fenêtre navigateur

#### getWindowSize()

Récupération de la taille de la fenêtre navigateur

* @return *{object}*

#### setState()

Définition de l'état courant

* @param *{string}* **state** default, fixed, bottom, disabled

#### getState()

Récupération de l'état courant

* @return *{string}*

#### setScrollTop()

Définition de la valeur courante ou précédente du scroll

* @param *{string}* **type** current, previous
* @param *{int|string}* **position** Valeur du scroll

#### getScrollTop()

Récupération de la valeur courante ou précédente du scroll

* @param *{string}* **type** current, previous
* @return *{int}*

#### update()

Met à jour les positions et les valeurs automatiques

#### fixed()

Fixe l'élément

#### bottom()

Place l'élément au bas du conteneur

#### reset()

Remet l'élément à la normale

#### disable()

Désactive Fixer

#### destroy()

Enlève Fixer du DOM


## Événements personnalisés

Il est possible de désactiver les événements de *scroll* et de *resize* pour les gérer d'une autre façon.

    var fixer = $('#element').fixer({
        scrollEvent: false,
        resizeEvent: false
    });

    var scroller = new $.Scroller();
    var deviceDetect = new $.DeviceDetect();

    scroller.onScroll(function () {
        // Appel du gestionnaire de scroll de Fixer en passant en paramètre l'événement scroll
        fixer.scrollHandler.call(fixer, this);
    });
    deviceDetect.onResize(function () {
        // Appel du gestionnaire de resize de Fixer en passant en paramètre l'événement resize
        fixer.resizeHandler.call(fixer, this);
    });