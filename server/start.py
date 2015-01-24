import logging
from tornado import web, ioloop, gen
from sockjs.tornado import SockJSRouter, SockJSConnection
from moat.server import GameConnection, main_loop


def get_logger():
    logger = logging.getLogger("moat")
    logger.setLevel(logging.DEBUG)
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(logging.Formatter(
        '%(asctime)s - %(levelname)s: %(message)s'
    ))
    logger.addHandler(ch)
    return logger


if __name__ == "__main__":
    logger = get_logger()
    logger.info("Starting up")

    gameRouter = SockJSRouter(GameConnection, '/game')
    app = web.Application(gameRouter.urls, debug=True)

    logger.info("Starting to listen for connections")
    app.listen(8000)

    try:
        loop = ioloop.IOLoop.instance()

        logger.info("Creating periodic callback")
        pc = ioloop.PeriodicCallback(main_loop, 1000/16)
        pc.start()

        logger.info("Starting IOLoop")
        loop.start()
    except KeyboardInterrupt:
        import pdb

        pdb.set_trace()

        print("foo")
