# ICare4U 🎁

A modern, interactive web application built with React and Vite that allows you to create highly personalized digital care packages, plan fun hangouts, and even let off steam in a digital Rage Room. 

** Live Demo**: [https://icare4u-weld.vercel.app](https://icare4u-weld.vercel.app)

## Features

* **📦 Digital Care Packages**: Build a custom care package with a personalized letter, hand-drawn doodles, photo memories (with captions!), stickers, and voice/video notes.
* **🗓️ Plan a Hangout**: Generate interactive invitations for dates or hangouts. Send the short link and let your friend pick the time, activity, and food! Responses are automatically emailed back to you.
* **🔨 Rage Room**: A 2D physics-based mini-game (powered by `matter-js`). Upload a photo of someone or something that frustrated you onto the ragdoll, and throw plates, glasses, and monitors around to relieve stress with satisfying shattering physics and sound effects.

##  Tech Stack

* **Frontend**: React (Vite)
* **Styling**: Vanilla CSS (Tailwind was strictly avoided per design philosophy to ensure unique, cozy, and warm aesthetics).
* **Animations**: Framer Motion
* **Physics Engine**: Matter.js
* **Backend / Storage**: Supabase (Database + Storage for user media and drawings)
* **Email Service**: EmailJS
* **Routing**: React Router DOM

##  Design Philosophy

ICare4U was designed to feel **warm, cozy, fun, and premium**. 
* **No generic emojis or boring icons.**
* **Rich Aesthetics**: Soft colors, glassmorphism, smooth micro-animations, and dynamic interactions.
* **Playful Physics**: The rage room mini-game allows for drag-and-drop physics, collision detection, and dynamic shattering polygons.

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
