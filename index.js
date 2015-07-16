
var taskStatus = {
    "SUCCEEDED" : "bar",
    "FAILED" : "bar-failed",
    "RUNNING" : "bar-running",
    "KILLED" : "bar-killed"
};

var now = moment.utc();
var todayStart = now.clone().hours(0).minutes(0).seconds(0);
var todayEnd = now.clone().hours(23).minutes(59).seconds(59);

var aircrafts = window.aircrafts = [{
    type: 'Light Jet',
    planes: [{
        name: 'Avion',
        plate: '125',
        base: 'SA',
        pax: '4',
        flights: [{
            legs: [{
                orig: 'SA',
                dest: 'LAX',
                repo: true,
                departure: todayStart.clone().hours(5).valueOf(),
                arrival: todayStart.clone().hours(7).valueOf()
            }, {
                orig: 'LAX',
                dest: 'NY',
                departure: todayStart.clone().hours(8).valueOf(),
                arrival: todayStart.clone().hours(12).valueOf()
            }, {
                orig: 'NY',
                dest: 'MEX',
                departure: todayStart.clone().hours(12).minutes(30).valueOf(),
                arrival: todayStart.clone().hours(17).valueOf()
            }]
        }]
    }, {
        name: 'Avion',
        plate: '1256',
        base: 'SA',
        pax: '3',
        flights: [{
            legs: [{
                orig: 'SA',
                dest: 'LAX',
                repo: true,
                departure: todayStart.clone().hours(2).valueOf(),
                arrival: todayStart.clone().hours(3).valueOf()
            }, {
                orig: 'LAX',
                dest: 'NY',
                departure: todayStart.clone().hours(3).valueOf(),
                arrival: todayStart.clone().hours(7).valueOf()
            }, {
                orig: 'NY',
                dest: 'MEX',
                departure: todayStart.clone().hours(8).minutes(30).valueOf(),
                arrival: todayStart.clone().hours(9).valueOf()
            }]
        }]
    }]
}];

var elList = $('.aircrafts-list');

_.each(aircrafts, function (aircraftType) {
    var titleRow = $('<div />', { 'class': 'aircraft-type' }).text(aircraftType.type),
        planeList = $('<ul/>');

    titleRow.appendTo($('.aircrafts-list'));

    elList.append(titleRow).append(planeList)
    _.each(aircraftType.planes, function (plane) {
        var planeRow = $('<li />', { 'id': 'plane-' + plane.plate}),
            planeWrap = $('<div />', { 'class': 'aircraft' }),
            planeName = $('<div />', {'class': 'name'}).text(plane.name),
            planeInfo = $('<div />', {'class': 'data'}).text([plane.plate, plane.base, plane.pax].join(' - '));

        planeWrap.append(planeName).append(planeInfo).appendTo(planeRow);
        planeRow.appendTo(planeList);
    });
});

var timeDomainString = "1day";

var board = d3.scheduleBoard({
    margin: {
         top : 20,
         right : 40,
         bottom : 20,
         left : 80
    },
    el: '.schedule-board'
});

board.timeDomain([ todayStart.valueOf(), todayEnd.valueOf() ]);


//changeTimeDomain(timeDomainString);

board();
board.addFlights(aircrafts)
board.addFlights([{
    type: 'Light Jet',
    planes: [{
        name: 'Avion',
        plate: '125',
        base: 'SA',
        pax: '4',
        flights: [{
            legs: [{
                orig: 'SA',
                dest: 'LAX',
                departure: todayStart.clone().hours(1).valueOf(),
                arrival: todayStart.clone().hours(3).valueOf()
            }]
        }]
    }]
}])

function changeTimeDomain(timeDomainString) {
    this.timeDomainString = timeDomainString;
    switch (timeDomainString) {
    case "1hr":
    format = "%H:%M:%S";
    board.timeDomain([ d3.time.hour.offset(getEndDate(), -1), getEndDate() ]);
    break;
    case "3hr":
    format = "%H:%M";
    board.timeDomain([ d3.time.hour.offset(getEndDate(), -3), getEndDate() ]);
    break;

    case "6hr":
    format = "%H:%M";
    board.timeDomain([ d3.time.hour.offset(getEndDate(), -6), getEndDate() ]);
    break;

    case "1day":
    format = "%H:%M";
    board.timeDomain([ d3.time.day.offset(getEndDate(), -1), getEndDate() ]);
    break;

    case "1week":
    format = "%a %H:%M";
    board.timeDomain([ d3.time.day.offset(getEndDate(), -7), getEndDate() ]);
    break;
    default:
    format = "%H:%M"

    }
    board.redraw(tasks);
}

function getEndDate() {
    var lastEndDate = Date.now();
    if (tasks.length > 0) {
    lastEndDate = tasks[tasks.length - 1].endDate;
    }

    return lastEndDate;
}

function addTask() {

    var lastEndDate = getEndDate();
    var taskStatusKeys = Object.keys(taskStatus);
    var taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)];
    var taskName = taskNames[Math.floor(Math.random() * taskNames.length)];

    tasks.push({
    "startDate" : d3.time.hour.offset(lastEndDate, Math.ceil(1 * Math.random())),
    "endDate" : d3.time.hour.offset(lastEndDate, (Math.ceil(Math.random() * 3)) + 1),
    "taskName" : taskName,
    "status" : taskStatusName
    });

    changeTimeDomain(timeDomainString);
    board.redraw(tasks);
};

function removeTask() {
    tasks.pop();
    changeTimeDomain(timeDomainString);
    board.redraw(tasks);
};
