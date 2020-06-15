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
        player = self.game_state.get_player(player_id)
        if player is None:
            self.player_id = player_id
        else:
            self.player = player
            self.player.connected = True

    def login(self, name):
        if self.player is not None:
            raise ClientError('already logged-in')
        if self.player_id is None:
            raise ClientError('not connected')
        player = Player(self.player_id, name)
        self.game_state.add_player(player)
        self.player = player

    def logout(self):
        if self.player is None:
            raise ClientError('not logged-in')
        self.game_state.remove_player(self.player)
        self.player = None

    def kick(self, player_id):
        player = self.game_state.get_player(player_id)
        if player is None:
            raise ClientError('player not found')
        if player.connected:
            raise ClientError('cannot kick player while they are still connected')
        self.game_state.remove_player(player)

    def new_game(self):
        self.game_state.new_game()

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
