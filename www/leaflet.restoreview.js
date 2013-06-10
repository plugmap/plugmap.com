/*
MIT License

Copyright (c) 2012 Makina Corpus

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function(){
var RestoreViewMixin = {
    restoreView: function () {
        var storage = window.localStorage || {};
        if (!this.__initRestore) {
            this.on('moveend', function (e) {
                if (!this._loaded)
                    return;  // Never access map bounds if view is not set.

                var view = {
                    lat: this.getCenter().lat,
                    lng: this.getCenter().lng,
                    zoom: this.getZoom()
                };
                storage['mapView'] = JSON.stringify(view);
            }, this);
            this.__initRestore = true;
        }

        var view = storage['mapView'];
        try {
            view = JSON.parse(view || '');
            this.setView(L.latLng(view.lat, view.lng), view.zoom, true);
            return true;
        }
        catch (err) {
            return false;
        }
    },
};

L.Map.include(RestoreViewMixin);
})();