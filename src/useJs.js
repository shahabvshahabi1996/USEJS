(function(window, document){

    const USE = function() {
        this._routeMap = {};
    }

    const routeObject = function(controller, route, path) {
        this.controller = controller;
        this.route = route;
        this.path = path;
    }

    USE.prototype.addRoute = function(controller, route, path) {
        this._routeMap[route] = new routeObject(controller, route, path);
    }

    USE.prototype.mount = function(elementId = 'app') {
        window.onload = () => {
            if (!window.location.hash) {
                window.history.pushState(null, null, '#/')
            }
            updateView.call(this, elementId);
        };
        window.onhashchange = updateView.bind(this, elementId);
    }


    const updateView = function(elementId = 'app') {
        const windowHash = window.location.hash.replace('#', '');
        const {path, controller} = this._routeMap[windowHash] || {};
        fetchFile(path, (result) => {
            document.getElementById(elementId).innerHTML = result ? injectDataToView(result.toString(), controller()) : '<h1>404 Not found</h1>';
        });
    }

    const fetchFile = function(path, cb){
        if (path) {
            fetch(path)
            .then(res => res.text())
            .then(res => cb(res));
        } else {
            cb(false)
        }
    }

    const injectDataToView = function(string, data) {
        let stringCopy = string;
        Object.keys(data).forEach(key => {
           stringCopy = stringCopy.replace(`{{${key}}}`, data[key]);
        })
        return stringCopy;
    }

    window['USE'] = new USE();
})(window, document)