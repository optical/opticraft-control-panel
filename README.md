# Opticraft Control Panel #

The Opticraft control panel is a personal project which provides a web interface which can be used by administrators to distribute vote rewards out to players on the Opticraft minecraft server. It is written in typescript.

This is an internal tool and as such it is unlikely to be of use to many people outside of the Opticraft development team, however anyone is free to contribute.

##Technical information
This project makes use of a variety of technologies. At its core, it is a nodejs web service, with a single-page front-end. The following is a list of some of the core technologies used

- [Node](https://nodejs.org/)
- [Typescript](http://www.typescriptlang.org/)
- [Express](http://expressjs.com/)
- [node-mysql](https://github.com/felixge/node-mysql/)
- [Convict](https://github.com/mozilla/node-convict)
- [Browserify](http://browserify.org/)
- [Bunyan](https://github.com/trentm/node-bunyan)
- [Knockout](http://knockoutjs.com/)
- [Gulp](http://gulpjs.com/)
- [Bootstrap](http://getbootstrap.com/)
- [Fontawesome](https://fortawesome.github.io/Font-Awesome/)

And several others!

##Building
We use gulp to build both the client. Execute the two lines below and everything should be ready to go. You will of-course need node installed. Version 0.10+ should work.

```
npm install
gulp
```

##Setup
Setup is slightly challenging at the moment as this repository does not contain all the relevant database scripts needed to get the site up and running. This will be rectified at some point in the future.

The web service can either run behind a reverse proxy or service requests directly. Additionally it supports being run inside a virtual directory without any configuration changes.

##Running
Simple execute `npm run start` and the service will be running on the configured port (default 8080). Logs are output to the console as JSON. When developing you can pipe the output through bunyan for a more readable format.

Configuration can be done using either a config file, environment variables or command-line options. At the moment documentation for these options can be found within the `src/web/config.ts` file.

##Todo
There are a number of things which could be done to improve this project. Take a look at the list below, or feel free to work on anything you wish.

- Improve page load
- Comprehensive setup guide
- Document all configuration options
- Better products list interface
- Client side error feedback
- Proper user authentication
- Testing
- Continuous integration
- Sample deployed site
