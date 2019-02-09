# Documentation Fixer

Ce script permet de fixer un élément par rapport à l'hauteur du scroll.

## Initialisation

    var fixer = $('#element').fixer([options]);


## Options

| Option                            | Type     | Valeur par défaut    | Description                                                                                                                                                   |
|-----------------------------------|----------|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| container                         | object   | undefined            | Conteneur de l'élément à fixer. Si la valeur n'est pas définie, c'est le *body* qui sera utilisé                                                              |
| start                             | integer  | undefined            | Hauteur du scroll à partir duquel l'élément sera fixé à partir du conteneur. Si la valeur n'est pas définie, c'est la position haute de l'élément à fixer     |
| end                               | integer  | undefined            | Hauteur du scroll à partir duquel l'élément ne sera plus fixé. Si la valeur n'est pas définie, c'est la hauteur du conteneur - la position haute de l'élément |
| offset                            | integer  | 0                    | Décalage des limites pour fixer                                                                                                                               |
| reverse                           | boolean  | false                | Inverser le fonctionnenemnt pour fixer l'élément. Si true, il faudra remonter la page pour fixer l'élément                                                    |
| scrollEvent                       | boolean  | true                 | Activer/Désactiver l'événenement de scroll. Voir section "Désactivation des événements"                                                                       |
| resizeEvent                       | boolean  | false                | Activer/Désactiver l'événenement de resize. Voir section "Désactivation des événements"                                                                       |
| resizeTimeout                     | integer  | 100                  | Delai avant l'execution de l'événement resize, en ms                                                                                                          |
| autoLoad                          | boolean  | true                 | Éxecuter Fixer à l'événement "load"                                                                                                                           |
| autoUpdate                        | boolean  | false                | Met à jour les positions de départ/fin de Fixer lors de l'événement "resize"                                                                                  |
| classes                           | object   | Voir ci-dessous      | Liste les options ci-dessous                                                                                                                                  |
| &nbsp;&nbsp;&nbsp;&nbsp;prefix    | string   | 'fixer'              | Préfix de classe                                                                                                                                              |
| &nbsp;&nbsp;&nbsp;&nbsp;container | string   | '{prefix}-container' | Classe pour le conteneur de l'élement à fixer                                                                                                                 |
| &nbsp;&nbsp;&nbsp;&nbsp;element   | string   | '{prefix}-element'   | Classe pour l'élement à fixer                                                                                                                                 |
| &nbsp;&nbsp;&nbsp;&nbsp;input     | string   | 'is-input'           | Classe pour indiquer si on est en train de saisir un formulaire                                                                                               |
| &nbsp;&nbsp;&nbsp;&nbsp;fixed     | string   | 'is-fixed'           | Classe pour indiquer si l'élement est fixé                                                                                                                    |
| &nbsp;&nbsp;&nbsp;&nbsp;bottom    | string   | 'is-bottom'          | Classe pour indiquer si l'élement est arrivé en bas du conteneur                                                                                              |
| &nbsp;&nbsp;&nbsp;&nbsp;reset     | string   | 'is-reset '          | Classe pour indiquer si l'élement est revenu à la normale                                                                                                     |
| afterEventsHandler                | function | undefined            | Callback après la déclaration des événements                                                                                                                  |
| onScroll                          | function | undefined            | Callback lors du scroll                                                                                                                                       |
| onResize                          | function | undefined            | Callback lors du resize                                                                                                                                       |
| onFixed                           | function | undefined            | Callback une fois l'élément fixé                                                                                                                              |
| onBottom                          | function | undefined            | Callback une fois l'élément arrivé en bas du conteneur                                                                                                        |
| onReset                           | function | undefined            | Callback une fois l'élément revenu à la normale                                                                                                               |
| onChangeState                     | function | undefined            | Callback à chaque changement d'état (default, fixed, bottom)                                                                                                  |
| debug                             | boolean  | false                | Affiche des informations pour le debug                                                                                                                        |


## Méthodes

| Méthode        | Arguments                                                                 | Description                                                              |
|----------------|---------------------------------------------------------------------------|--------------------------------------------------------------------------|
| setStart       | **pos** *int* Position                                                    | Définition de la position de départ                                      |
| getStart       | -                                                                         | Récupération de la position de départ                                    |
| setEnd         | **pos** *int* Position, **addStart** *bool* Ajouter la position de départ | Définition de la position de fin                                         |
| getEnd         | -                                                                         | Récupération de la position de fin                                       |
| setState       | **state** *string* default, fixed, bottom                                 | Définition de l'état courant                                             |
| getState       | -                                                                         | Récupération de l'état courant                                           |
| getScrollTop   | **prev** *bool* get the previous value of scroll top                      | Récupération de la valeur courante du scroll                             |
| getContainer   | **container** *jQuery object*                                             |                             |
| setContainer   | -                                                                         |                             |
| getFixer       | **element** *jQuery object*                                               |                             |
| setFixer       | -                                                                         |                             |
| update         | -                                                                         | Met à jour les positions de début/fin de scroll par rapport au conteneur |
| fixed          | -                                                                         | Fixe l'élément                                                           |
| bottom         | -                                                                         | Place l'élément au bas du conteneur                                      |
| reset          | -                                                                         | Remet l'élément à la normale                                             |
| destroy        | -                                                                         | Enlève fixer du DOM                                                      | 


## Désactivation des événements

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