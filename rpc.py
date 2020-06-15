from player import Player, PlayerCard


class RPC(object):
    def __init__(self, ws, game_state):
        self.ws = ws
        self.game_state = game_state
        self.player_id = None
        self.player = None

    def connect(self, player_id):
        if self.player_id is not None or self.player is not None:
            raise ClientError('already connected')
        self.player_id = player_id

    def login(self, name):
        if self.player is not None:
            raise ClientError('already logged-in')
        if self.player_id is None:
            raise ClientError('not connected')
        player = Player(self.player_id, name)
        self.game_state.add_player(player)
        self.player = player
        self.player_id = None

    def logoff(self):
        if self.player is None:
            raise ClientError('not logged-in')
        self.game_state.remove_player(self.player)
        self.player = None

    def deal_all(self, down, up):
        for _ in range(down):
            for player in self.game_state.players:
                card = self.game_state.draw_card()
                player.give_card(PlayerCard(card, False))
        for _ in range(up):
            for player in self.game_state.players:
                card = self.game_state.draw_card()
                player.give_card(PlayerCard(card, True))

class ClientError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message
