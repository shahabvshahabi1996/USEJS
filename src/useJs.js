(function(window, document){

    const includeRegex = /\$include\('(.*?)'\)/g;

    const USE = function() {
        this._routeMap = {};
    }

    const routeObject = function(route, path) {
        this.route = route;
        this.path = path;
    }

    USE.prototype.addRoute = function(route, path) {
        this._routeMap[route] = new routeObject(route, path);
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
        const {path} = this._routeMap[windowHash] || {};
        fetchFile(path)
        .then(result => {
            const data = compileFile(result);
            document.getElementById(elementId).innerHTML = data;
            [...document.getElementById(elementId).querySelectorAll('include')].forEach(item => {
                const path = item.getAttribute('src');
                fetchFile(path)
                .then(res => {
                    item.insertAdjacentHTML('afterend', compileFile(res));
                    item.remove();
                })
            })
        })
        .catch(() => {
            document.getElementById(elementId).innerHTML =  '<h1>404 Not found</h1>';
        });
    }

    const fetchFile = function(path){
        return fetch(path)
                .then(res => res.text())
                .then(res => res);
    }

    const compileFile = function(result){
            const html = document.createElement('body');
            html.innerHTML = result;
            const content = html.querySelector('template') || '';
            const script = html.querySelector('script') || ''
            const controller = eval(script ? script.innerHTML : '() => {}');
            return injectDataToView(content ? content.innerHTML.toString() : '', controller());
    }

    const injectDataToView = function(string = "", data = {}) {
        let stringCopy = string;
        Object.keys(data).forEach(key => {
           stringCopy = stringCopy.replace(`{{${key}}}`, data[key]);
        });
        return stringCopy;
    }

    window['USE'] = new USE();
})(window, document)