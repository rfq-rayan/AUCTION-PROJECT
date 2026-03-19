# Player Auction Management System

A web application for managing player auctions. Handles player invitations, bidding, and player distribution to teams.

## Overview

Full-stack application for player auctions. Admins create and manage auctions. Teams, players, and bid managers participate through separate interfaces. Supports real-time bidding, automatic player distribution, and fund management.

## Demo
[Video Link](https://www.facebook.com/masnoon.muztahid/videos/877874807396061/)

## Features

### User Roles

**Admin**
- Create and manage auctions
- Change auction status (Future, Current, Past)
- Invite players, teams, and bid managers
- Delete future auctions

**Team**
- View assigned auctions
- Place bids on players
- Manage funds and player limits
- View purchase history
- Update profile

**Player**
- Receive auction invitations
- Accept or decline invitations
- View assigned auctions
- View sales history
- Update profile

**Bid Manager**
- Add players to bidding zone
- Control which players are up for bid
- Monitor active bids

### Bidding System

- 5-minute timer per player bid
- Automatic player assignment when timer expires
- Teams cannot bid consecutively on same player
- New bids must exceed previous price
- Fund validation before accepting bids
- Player limit enforcement
- Unsold players marked when no bids received

### Auction Workflow

1. Admin creates auction (Future status)
2. Admin invites players, teams, and assigns bid manager
3. Participants accept or decline invitations
4. Admin changes status to Current
5. Bid manager adds players to bidding zone
6. Teams place bids
7. System automatically distributes players when timers expire
8. Admin changes status to Past when complete

### Other Features

- Notification system for invitations
- Fund management and tracking
- Profile management for all user types
- Sales history tracking
- Password hashing with bcrypt
- Role-based access control

## Technology Stack

**Frontend**
- React 18.2
- React Router 6.15
- PrimeReact 9.6
- Axios 1.4

**Backend**
- Node.js
- Express 4.18
- Oracle Database
- bcrypt 5.1

## Project Structure

```
AUCTION-PROJECT/
├── player-auction-app/          # React frontend
│   ├── src/
│   │   ├── adminpage/
│   │   ├── auctiondetails/
│   │   ├── biddingarena/
│   │   ├── players/
│   │   ├── teams/
│   │   ├── login/
│   │   └── register/
│   └── public/
│
└── player-auction-backend/       # Node.js backend
    └── index.js                 # Express API server
```
