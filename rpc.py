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

        # record the connection for this id
        self.game_state.player_id_connections[player_id].append(self)

        self.player_id = player_id

        # check for existing player with this id
        player = self.game_state.get_player(player_id)
        if player is not None:
            # player exists, connect as that player
            player.connected = True
            self.player = player


    def login(self, name):
        if self.player is not None:
            raise ClientError('already logged-in')
        if self.player_id is None:
            raise ClientError('not connected')

        # create a new player
        player = Player(self.player_id, name)
        # add to the game
        self.game_state.add_player(player)
        # mark player as connected
        player.connected = True
        self.player = player

    def logout(self):
        if self.player is None:
            raise ClientError('not logged-in')

        # remove player from game
        self.game_state.remove_player(self.player)

        # log out every connection logged in as this player
        for rpc in self.game_state.player_id_connections[self.player_id]:
            rpc.player = None

    def kick(self, player_id):
        # find the player
        player = self.game_state.get_player(player_id)
        if player is None:
            raise ClientError('player not found')
        if player.connected:
            raise ClientError('cannot kick player while they are still connected')

        # remove player from game
        self.game_state.remove_player(player)

        # log out every connection logged in as this player
        for rpc in self.game_state.player_id_connections[player.id]:
            rpc.player = None

    def new_game(self):
        self.game_state.new_game()

    def deal_all(self, down, up):
        # only consider players in the hand
        players = list(self.game_state.players_in_hand())

        # check that deck has enough cards to give to each player
        if len(self.game_state.deck) < (down + up) * len(players):
            raise ClientError('deck does not have enough cards')

        for _ in range(down):
            for player in players:
                card = self.game_state.draw_card()
                player.give_card(PlayerCard(card, False))
        for _ in range(up):
            for player in players:
                card = self.game_state.draw_card()
                player.give_card(PlayerCard(card, True))

    def fold(self):
        if self.player is None:
            raise ClientError('not logged-in')

        self.player.in_hand = False

class ClientError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message
