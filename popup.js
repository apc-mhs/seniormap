function definePopupClass() {
    /**
     * A customized popup on the map.
     * @param {!google.maps.LatLng} position
     * @param {!Element} content
     * @constructor
     * @extends {google.maps.OverlayView}
     */
    Popup = function(position, content) {
        this.position = position;

        content.classList.add('popup-content');

        var pixelOffset = document.createElement('div');
        pixelOffset.classList.add('popup');
        pixelOffset.appendChild(content);

        this.anchor = document.createElement('div');
        this.anchor.classList.add('popup-tip');
        this.anchor.appendChild(pixelOffset);

        // Optionally stop clicks, etc., from bubbling up to the map.
        this.stopEventPropagation();
    };
    // NOTE: google.maps.OverlayView is only defined once the Maps API has
    // loaded. That is why Popup is defined inside initMap().
    Popup.prototype = Object.create(google.maps.OverlayView.prototype);

    /** Called when the popup is added to the map. */
    Popup.prototype.onAdd = function() {
        this.getPanes().floatPane.appendChild(this.anchor);
    };

    /** Called when the popup is removed from the map. */
    Popup.prototype.onRemove = function() {
        if (this.anchor.parentElement) {
            this.anchor.parentElement.removeChild(this.anchor);
        }
    };

    /** Called when the popup needs to draw itself. */
    Popup.prototype.draw = function() {
        var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
        this.anchor.style.left = divPosition.x + 'px';
        this.anchor.style.top = (divPosition.y-50) + 'px';
    };

    /** Stops clicks/drags from bubbling up to the map. */
    Popup.prototype.stopEventPropagation = function() {
        var anchor = this.anchor;
        anchor.style.cursor = 'auto';

        ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart',
            'pointerdown']
            .forEach(function(event) {
                anchor.addEventListener(event, function(e) {
                    e.stopPropagation();
                });
            });
    };
}

