ymaps.ready(init);

function createPoint(coords, radius, control, co) {
    if (Math.random() >= 0.5) {
        coords[0]-=Math.random()*0.005*radius/1000
    } else {
        coords[0]+=Math.random()*0.005*radius/1000
    }
    if (Math.random() >= 0.5) {
        coords[1]-=Math.random()*0.005*radius/1000
    } else {
        coords[1]+=Math.random()*0.005*radius/1000
    }
    var ret = new ymaps.Placemark([coords[0],coords[1]], {name:'point'});
    control.routePanel.state.set({
        from: co,
        to: [coords[0],coords[1]]
    });
    return ret
}

function setTypeAndPan (cords) {
    // Меняем тип карты на "Гибрид".
    myMap.setType('yandex#hybrid');
    // Плавное перемещение центра карты в точку с новыми координатами.
    myMap.panTo(cords, {
            // Задержка между перемещениями.
            delay: 1500
        });
}

function editCircle(coords,radius) {
    var ret = new ymaps.Circle([cords, radius], null, { draggable: true })
    return ret
}

async function init() {
    var cords=[10,10]
    var radius=50*50
    var slider = document.getElementById("myRange");

    var geolocation = ymaps.geolocation,
        myMap = new ymaps.Map('map', {
            center: [55, 34],
            zoom: 3,
            controls: ['typeSelector',  'fullscreenControl', 'routePanelControl']
        }, {
            searchControlProvider: 'yandex#search'
        });
        firstButton = new ymaps.control.Button({
            data: {content: 'generate', title: 'create the new point'}, 
            options: {maxWidth: 250},
            events: {click:onclick}
        });
        circle=new ymaps.Circle([[0,0], 1], null, { draggable: true, fillOpacity: 0.3});

    var control = myMap.controls.get('routePanelControl');
    control.routePanel.state.set({
        type: 'pedestrian',
        fromEnabled: false,
        toEnabled: false
    });

    slider.oninput = function() {
        l=myMap.geoObjects.getLength()
        for (let i = 0; i<l; i++) {
            o=myMap.geoObjects.get(i)
            if (o && o.properties && o.properties.get('name') == "circle") {
                myMap.geoObjects.remove(o)
            }
        }
        circle=new ymaps.Circle([cords, this.value*50], {name:'circle'}, { draggable: true, fillOpacity: 0.3});
        myMap.geoObjects.add(circle)
        radius=this.value*50
        circle.events.add('dragend', function() {
            l=myMap.geoObjects.getLength()
            for (let i = 0; i<l; i++) {
                o=myMap.geoObjects.get(i) || {properties:{get:function(){}}}
                if (o.properties && o.properties.get('name') == "circle") {
                    cordsn=o.geometry.getCoordinates()
                    radius=o.geometry.getRadius()
                }
            }
        })
    }

    geolocation.get({
        provider: 'browser',
        mapStateAutoApply: true
    }).then(function (result) {
        result.geoObjects.options.set('preset', 'islands#blueCircleIcon');
        myMap.geoObjects.add(result.geoObjects);
        cords=result.geoObjects.position
        cordsn=[...cords]
        circle=new ymaps.Circle([cords, 50*50], {name:'circle'}, { draggable: true, fillOpacity: 0.3});
        myMap.geoObjects.add(circle)
        myMap.setType('yandex#hybrid');
    });

    firstButton.events.add('click', function onclick(event) {
        l=myMap.geoObjects.getLength()
        for (let i = 0; i<l; i++) {
            o=myMap.geoObjects.get(i)
            try {
                if (o.properties.get('name') == "point") {
                    myMap.geoObjects.remove(o)
                }
            }
            catch {}
        }
        var newCord=[...cordsn]
        var newRadius=radius
        var c = createPoint(newCord, newRadius, control, cords)
        myMap.geoObjects.add(c);
    });

    myMap.controls.add(firstButton, {float: 'right'});
    // myMap.events.add('click', function (e) {
    //     if (!myMap.balloon.isOpen()) {
    //         var coords = e.get('coords');
    //         myMap.balloon.open(coords, {
    //             contentHeader:'Событие!',
    //             contentBody:'<p>Кто-то щелкнул по карте.</p>' +
    //                 '<p>Координаты щелчка: ' + [
    //                 coords[0].toPrecision(6),
    //                 coords[1].toPrecision(6)
    //                 ].join(', ') + '</p>',
    //             contentFooter:'<sup>Щелкните еще раз</sup>'
    //         });
    //     }
    //     else {
    //         myMap.balloon.close();
    //     }
    // });
}

