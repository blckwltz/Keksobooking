'use strict';

(function () {

  var MAIN_PIN_POSITION = {
    x: 600,
    y: 375
  };

  var map = document.querySelector('.map');

  var mapPinMain = map.querySelector('.map__pin--main');

  var mapFilters = map.querySelector('.map__filters-container');

  var pinsContainer = document.querySelector('.map__pins');

  map.insertBefore(window.generateAdvertCard(window.adverts[0]), mapFilters);

  var housingFilters = map.querySelectorAll('[id|="housing"]');

  [].forEach.call(housingFilters, function (filter) {
    filter.disabled = true;
  });

  window.form.address.value = MAIN_PIN_POSITION.x + ', ' + MAIN_PIN_POSITION.y;

  var loadedData = []; // Копировать

  var onPinsLoad = function (data) {
    loadedData = data;
    window.pin.renderPins(data);
    [].forEach.call(housingFilters, function (filter) {
      filter.disabled = false;
    });
  };

  var toActiveState = function () {
    map.classList.remove('map--faded');

    window.form.form.classList.remove('notice__form--disabled');

    [].forEach.call(window.form.filters, function (filter) {
      filter.disabled = false;
    });

    window.form.address.value = (mapPinMain.offsetLeft + window.util.POSITION_OFFSET.x) + ', '
      + (mapPinMain.offsetTop + window.util.POSITION_OFFSET.y);

    window.load(onPinsLoad, window.util.renderErrorElement);

    onFilterChange();
  };

  mapPinMain.addEventListener('mouseup', toActiveState);

  mapPinMain.addEventListener('mousedown', window.onPinMove);

  window.map = {
    map: map,
    mainPin: mapPinMain,
    adverts: loadedData,
    container: pinsContainer,
    filters: housingFilters,
    toInactiveState: function () {
      map.classList.add('map--faded');
      window.form.form.classList.add('notice__form--disabled');

      [].forEach.call(housingFilters, function (filter) {
        filter.disabled = true;
      });

      [].forEach.call(window.form.inputs, function (input) {
        input.value = '';
        input.style = 'outline: none';
      });

      [].forEach.call(window.form.filters, function (filter) {
        filter.disabled = true;
      });

      mapPinMain.style.left = MAIN_PIN_POSITION.x + 'px';
      mapPinMain.style.top = MAIN_PIN_POSITION.y + 'px';
      window.form.address.value = MAIN_PIN_POSITION.x + ', ' + MAIN_PIN_POSITION.y;

      window.pin.removePins();

      window.form.onRoomsChange();
    }
  };

  var typeFilter = window.map.map.querySelector('#housing-type');
  var priceFilter = window.map.map.querySelector('#housing-price');
  var roomsFilter = window.map.map.querySelector('#housing-rooms');
  var guestsFilter = window.map.map.querySelector('#housing-guests');
  var featuresFilters = document.querySelectorAll('[id|="filter"]');

  var priceValues = {
    any: function () {
      return true;
    },
    middle: function (price) {
      return price > 10000 && price < 50000;
    },
    low: function (price) {
      return price < 10000;
    },
    high: function (price) {
      return price > 50000;
    }
  };


  var filterByType = function (advert) {
    if (typeFilter.value === 'any') {
      return true;
    }
    return advert.offer.type === typeFilter.value;
  };

  var filterByPrice = function (advert) {
    var activePrice = priceValues[priceFilter.value];
    return activePrice(advert.offer.price);
  };

  var filterByRooms = function (advert) {
    if (roomsFilter.value === 'any') {
      return true;
    }
    return advert.offer.rooms.toString() === roomsFilter.value;
  };

  var filterByGuests = function (advert) {
    if (guestsFilter.value === 'any') {
      return true;
    }
    return advert.offer.guests.toString() === guestsFilter.value;
  };

  var filterByFeature = function (advert) {
    var featuresFiltersActive = document.querySelectorAll('[id|="filter"]:checked');
    var activeFeatures = [].map.call(featuresFiltersActive, function (filter) {
      return filter.value;
    });
    activeFeatures.every(function (feature) {
      return advert.offer.features.includes(feature);
    });
  };

  // var filterPins = function (advert) {
  //   return filterByType(advert) && filterByPrice(advert) && filterByRooms(advert)
  //     && filterByGuests(advert);
  // };

  var onFilterChange = function () {
    var data = loadedData.splice(0);

    var filteredPins = data.filter(function (advert) {
      return filterByType(advert) && filterByPrice(advert) && filterByRooms(advert)
        && filterByGuests(advert);
    });

    window.map.map.children[1].hidden = true;

    window.pin.removePins(loadedData);

    window.pin.renderPins(filteredPins);

    [].forEach.call(window.map.filters, function (filter) {
      filter.addEventListener('change', onFilterChange);
    });
  };
})();
