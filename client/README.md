# Mountain Legacy Project: Explorer App
(c) 2020 Runtime Software Development Inc.

## Overview

### The Mountain Legacy Project

The Mountain Legacy Project (MLP) explores changes in Canada’s mountain landscapes 
through the world’s largest collection of systematic high-resolution historic mountain 
photographs (more than 120,000) and a vast and growing collection of repeat images 
(more than 8,000 photo pairs). Find out about our research and how we turn remarkable 
photos into real-world solutions for understanding climate change, ecological processes, 
and strategies for ecological restoration.

### MLE Explorer
    
The Explorer index is a metadata management tool for browsing and editing the MLP collection and 
viewing historic and corresponding repeat (modern) survey images. 

Accessible to Authenticated Users, the Mountain Legacy Explorer (MLE) Editor can be 
used to manage the digital assets and metadata of the MLP collection. Through the Editor, 
users can upload or delete images in the collection data store, add and update image 
metadata, as well as align and master historic and repeat digital photographs.


## Services

The project consists of three microservices:

1. MLE Explorer Client (ReactJS)
2. MLE API (NodeJS)
3. MLE Image Transcoder (NodeJS)

This project was bootstrapped with 
[Create React App](https://github.com/facebook/create-react-index).

## Requirements

### ReactJS

    "file-saver": "^2.0.5",
    "mathjs": "^9.4.1",
    "react": "^17.0.1",
    "react-dom": "^17.0.2",
    "react-flatpickr": "^3.10.7",
    "react-helmet": "^6.1.0",
    "react-idle-timer": "^4.5.6",
    "react-scripts": "^4.0.3",
    "utif": "^3.1.0"

### NodeJS

    "amqplib": "^0.8.0",
    "busboy": "^0.3.1",
    "cookie-parser": "^1.4.5",
    "cors": "^2.8.5",
    "dcraw": "^1.0.3",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "helmet": "^4.6.0",
    "jsonwebtoken": "^8.5.1",
    "leaflet": "^1.7.1",
    "mathjs": "^9.4.2",
    "morgan": "^1.10.0",
    "nanoid": "^3.1.16",
    "node-fetch": "^2.6.1",
    "node-forge": ">=0.10.0",
    "pg": "^8.5.1",
    "pm2": ">=5.1.0",
    "react": "^17.0.2",
    "redis": "^3.1.2",
    "sharp": "^0.28.3",
    "uid-safe": "^2.1.5"