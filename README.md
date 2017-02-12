# Documentation Fixer

Ce script permet de fixer un élément par rapport à l'hauteur du scroll.

## Initialisation

    var Fixer = $('#element-a-fixer').fixer([options]);


## Options

| Option                            | Type     | Valeur par défaut    | Description                                                                                                                                                   |
|-----------------------------------|----------|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| container                         | object   | undefined            | Conteneur de l'élément à fixer. Si la valeur n'est pas définie, c'est le parent de l'élément                                                                  |
| from                              | integer  | undefined            | Hauteur du scroll à partir duquel l'élément sera fixé. Si la valeur n'est pas définie, c'est la position haute de l'élément                                   |
| to                                | integer  | undefined            | Hauteur du scroll à partir duquel l'élément ne sera plus fixé. Si la valeur n'est pas définie, c'est la hauteur du conteneur - la position haute de l'élément |
| reverse                           | boolean  | false                | Inverser le fonctionnenemnt pour fixer l'élément. Si true, il faudra remonter la page pour fixer l'élément.                                                   |
| classes                           | object   | Voir ci-dessous      | Liste les options ci-dessous                                                                                                                                  |
| &nbsp;&nbsp;&nbsp;&nbsp;prefix    | string   | 'fixer'              | Préfix de classe                                                                                                                                              |
| &nbsp;&nbsp;&nbsp;&nbsp;container | string   | '{prefix}-container' | Classe pour le conteneur de l'élement à fixer                                                                                                                 |
| &nbsp;&nbsp;&nbsp;&nbsp;element   | string   | '{prefix}-element'   | Classe pour l'élement à fixer                                                                                                                                 |
| &nbsp;&nbsp;&nbsp;&nbsp;input     | string   | 'is-input'           | Classe pour indiquer si on est en train de saisir un formulaire                                                                                               |
| &nbsp;&nbsp;&nbsp;&nbsp;fixed     | string   | 'is-fixed'           | Classe pour indiquer si l'élement est fixé                                                                                                                    |
| &nbsp;&nbsp;&nbsp;&nbsp;bottom    | string   | 'is-bottom'          | Classe pour indiquer si l'élement est arrivé en bas du conteneur                                                                                              |
| afterEventsHandler                | function | undefined            | Callback après la déclaration des événements                                                                                                                  |
| onScroll                          | function | undefined            | Callback lors du scroll                                                                                                                                       |
| onFixed                           | function | undefined            | Callback une fois l'élément fixé                                                                                                                              |
| onBottom                          | function | undefined            | Callback une fois l'élément arrivé en bas du conteneur                                                                                                        |
| onReset                           | function | undefined            | Callback une fois l'élément revenu à la normale                                                                                                               |

## Méthodes

| Méthode        | Arguments | Description                                                |
|----------------|-----------|------------------------------------------------------------|
| setFixerTop    | -         | Détermine le départ du scroll pour fixer l'élement         |
| setFixerBottom | -         | Détermine la fin du scroll pour arrêter de fixer l'élément |
| toFixed        | -         | Fixe l'élément                                             |
| toBottom       | -         | Place l'élément au bas du conteneur                        |
| toReset        | -         | Remet l'élément à la normale                               |