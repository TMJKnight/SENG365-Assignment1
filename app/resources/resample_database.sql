# MySQL script for inserting sample data into the database


INSERT INTO VenueCategory
    (category_id, category_name, category_description)
VALUES
    (1, 'Accommodation', 'The best places to stay in town.'),
    (2, 'Cafés & Restaurants', 'The finest dining in town.'),
    (3, 'Attractions', 'The best things to see in town.'),
    (4, 'Events', 'What\'s going on in town.'),
    (5, 'Nature Spots', 'The most beautiful bits of nature in town.');

INSERT INTO Venue
    (venue_id, admin_id, category_id, venue_name, city, short_description, long_description, date_added, address,
    latitude, longitude)
VALUES
    (1, 1, 2, 'The Wok', 'Christchurch', 'Home of the world-famous $2 rice', '', '2018-12-25',
    'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
    -43.523617, 172.582885),
    (2, 2, 5, 'Ilam Gardens', 'Christchurch', 'Kinda pretty', '', '2019-01-01',
    '87 Ilam Rd, Ilam, Christchurch 8041, New Zealand',
    -43.524219, 172.576032),
    (3, 3, 1, 'Erskine Building', 'Christchurch', 'Many a late night has been spent here', '', '2019-01-01',
    'Erskine Science Rd, Ilam, Christchurch 8041, New Zealand',
    -43.522535, 172.581086);

INSERT INTO Review
    (reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating, time_posted)
VALUES
    (1, 8, 'No more $2 rice, it\'s all a lie.', 3, 4, '2019-02-20 22:05:24'),
    (1, 9, 'Good rice for a good price.', 4, 2, '2019-02-12 18:42:01'),
    (3, 8, 'Had to provide our own beanbags to sleep on.', 1, 0, '2018-09-28 07:42:11'),
    (3, 3, 'Good air conditioning.', 5, 0, '2018-06-01 10:31:45'),
    (3, 4, 'My favourite place on earth.', 4, 3, '2019-01-19 12:34:59');