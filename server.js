const http = require('http');
const fs = require('fs');
const { URL } = require('url');

function loadOrInitializeMenuArray(filename, callback) {
    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
            callback([]);
        } else {
            callback(JSON.parse(data || '[]'));
        }
    });
}

function storeMenu(filename, menu) {
    fs.writeFile(filename, JSON.stringify(menu), (err) => {
        if (err) {
            console.log(err.message);
            return;
        }

        console.log('File has been updated');
    });
}

const POSTHandler = (file, query, cb) => {
    if (!query.code || query.code.length !== 5) {
        cb(400, "BAD REQUEST");
        return; 
    }
    
    loadOrInitializeMenuArray(file, (menu) => {
        let index = menu.findIndex((item) => item.code === query.code);

        if (index !== -1) {
            cb(400, "BAD REQUEST");
            return;
        }

        menu.push(query);
        storeMenu(file, menu);
        cb(200, "OK");
    });
};

const DELETEHandler = (file, code, cb) => {
    loadOrInitializeMenuArray(file, (menu) => {
        let index = menu.findIndex((item) => item.code === code);

        if (menu.length === 0 || index === -1) {
            cb(404, "NOT FOUND");
            return;
        }

        menu.splice(index, 1);
        storeMenu(file, menu);
        cb(200, "OK");
    });
};

const GETHandler = (file, code, cb) => {
    loadOrInitializeMenuArray(file, (menu) => {
        let index = menu.findIndex((item) => item.code === code);

        if (menu.length === 0 || index === -1) {
            cb(404, "NOT FOUND");
            return;
        }

        cb(200, JSON.stringify(menu[index]));
    });
};

const PUTHandler = (file, code, query, cb) => {
    loadOrInitializeMenuArray(file, (menu) => {
        let index = menu.findIndex((item) => item.code === code);

        if (menu.length === 0 || index === -1) {
            cb(404, "NOT FOUND");
            return;
        }

        for (let key of Object.keys(query)) {
            menu[index][key] = query[key];
        }

        storeMenu(file, menu);
        cb(200, "OK");
    });
};

const server = http.createServer((req, res) => {
    const baseURL = `http://${req.headers.host}/`;
    const { pathname, searchParams } = new URL(req.url, baseURL);

    let query = Object.fromEntries(searchParams.entries());

    let { method } = req;
    let pathSegments = pathname.split('/');
    let resource = pathSegments[1];
    let code = pathSegments[2];

    switch (method) {
        case 'GET':
            if (resource === 'menu' && code) {          
                GETHandler('./menu/menu.json', code, (statusCode, item) => {
                    if(statusCode === 200) {
                       res.writeHead(statusCode, {
                          'Content-Type': 'application/json'
                       });
                       res.end(item);
                    } else {
                        res.writeHead(statusCode);
                        res.end(item);
                    }
                });
            } else if (resource === 'menu') {
                let menuStream = fs.createReadStream('./menu/menu.json');

                menuStream.on('error', () => {
                    res.writeHead(404);
                    res.end('NOT FOUND');
                });

                res.setHeader('Content-Type', 'application/json');
                menuStream.pipe(res);
            } else {
                let welcomeStream = fs.createReadStream('./welcome/welcome.txt');


                welcomeStream.on('error', () => {
                    res.writeHead(404);
                    res.end('NOT FOUND');
                });

                welcomeStream.pipe(res);
            }
            break;

        case 'POST':
            if (resource === 'menu') {
                POSTHandler('./menu/menu.json', query, (statusCode, statusMessage) => {
                    res.writeHead(statusCode);
                    res.end(statusMessage);
                    
                });
            } else {
                res.writeHead(400);
                res.end('BAD REQUEST');
            }
            break;

        case 'PUT':
            if (resource === 'menu') {
                PUTHandler('./menu/menu.json', code, query, (statusCode, statusMessage) => {
                    res.writeHead(statusCode);
                    res.end(statusMessage);
                });
            } else {
                res.writeHead(400);
                res.end('BAD REQUEST');
            }
            break;

        case 'DELETE':
            if (resource === 'menu') {
                DELETEHandler('./menu/menu.json', code, (statusCode, statusMessage) => {
                    res.writeHead(statusCode);
                    res.end(statusMessage);
                });
            } else {
                res.writeHead(400);
                res.end('BAD REQUEST');
            }
            break;

        default:
            res.writeHead(400);
            res.end('BAD REQUEST');
    }
});

server.listen(3030);