from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):

    def setUp(self):
        """before every test"""

        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_homepage(self):
        """Make sure information is displayed"""

        with self.client:
            response = self.client.get('/')
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('nplays'))
            self.assertIn(b'<p>High Score:', response.data)
            self.assertIn(b'Score:', response.data)
            self.assertIn(b'Seconds Left:', response.data)

    def test_valid_word(self):
        """Test if word is valid by modifying the board in the session"""

        with self.client as client:
            with client.session_transaction() as sess:
                sess['board'] = [["T", "A", "T", "D", "T"], 
                                 ["T", "A", "T", "D", "T"], 
                                 ["T", "A", "T", "D", "T"], 
                                 ["A", "T", "T", "T", "D"], 
                                 ["T", "A", "T", "D", "T"]]
        response = self.client.get('/check-word?word=tat')
        self.assertEqual(response.json['result'], 'ok')

    def test_invalid_word(self):
        """Check if word is on board"""

        self.client.get('/')
        response = self.client.get('/check-word?word=impossible')
        self.assertEqual(response.json['result'], 'not-on-board')

    def not_word(self):
        """Test if word is in dict"""

        self.client.get('/')
        response = self.client.get(
            '/check-word?word=halajakm')
        self.assertEqual(response.json['result'], 'not-word')
