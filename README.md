# Beadifier - [Demo](http://beadifier.eremes.xyz)

### Main purpose

* Display image as bead project
* Edit color palette (Hama, Nabbi, Artkal, PerlerBeads)
* Edit bead type (Mini, Midi)
* Edit project size
* Display beads usage
* Export bead sheets as .pdf
* No installation required

### Build

Project can be built using the following command :

```
yarn build:prod
```

### Docker

Docker image is based on [Nginx Image](https://hub.docker.com/_/nginx/) in order to serve static content.

Helper commands are available

> Build content and then build Docker image.
```
yarn docker:build
```

> Stop container
```
yarn docker:stop
```

> Remove container
```
yarn docker:rm
```

> All-in-on command, does the following action : Stop, Remove, Build, Start
```
yarn docker:start
```

### Contribute

Project can be run locally by using the following command : 

```
yarn start
```


