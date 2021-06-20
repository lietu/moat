Moat
====

Attempt at creating a multiplayer online browser based game.

Backend is using [Tornado](http://www.tornadoweb.org/), frontend is using
[Pixi](http://www.pixijs.com/).


What does it look like?
-----------------------

[![Quick video of Moat](http://img.youtube.com/vi/lgFNokoAdNQ/0.jpg)](http://youtu.be/lgFNokoAdNQ)



Requirements
------------

To run the server you will need:
 * [Vagrant](https://www.vagrantup.com/downloads.html)
 * [VirtualBox](https://www.virtualbox.org/wiki/Downloads)


Usage
-----

Download this repository's contents one way or another (e.g. clone it).

Open a terminal/command prompt window to the folder with this file in it.

Start the Virtual Machine for the server:
```
vagrant up
```

Connect to the VM via SSH, on *nix machines you can just:
```
vagrant ssh
```

On Windows you'll need to get a separate [SSH client](http://www.9bis.net/kitty/) and either login manually with the IP `172.16.16.16` using username and password `vagrant` or get the configuration using:
```
vagrant ssh-config
```

Once connected over SSH, prepare the client for use:
```
cd /src/
bower install
```

Then start the server:
```
sudo su - moat
workon moat
cd /src/server
python start.py
```


Attributions
------------

Some art from OpenGameArt.org.
 
Thanks to:
 - [AwesomePenguin](http://opengameart.org/users/awesomepenguin)
 - [Marcelo Fernandez](http://marcelofernandez.tk/)
 - [sebbsubb](http://opengameart.org/users/sebbsubb)
 - [Luke (Rust Ltd)](http://opengameart.org/users/lukerustltd)


License
-------

This project is licensed under the new BSD and MIT licenses. For more information read the LICENSE.md file.


# Financial support

This project has been made possible thanks to [Cocreators](https://cocreators.ee) and [Lietu](https://lietu.net). You can help us continue our open source work by supporting us on [Buy me a coffee](https://www.buymeacoffee.com/cocreators).

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/cocreators)
