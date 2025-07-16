# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a second-hand transaction platform project developed based on `uni-app`. It uses `Vue 3` and `TypeScript`. The project is configured to be compiled into multiple terminals such as web (H5) and various small programs.

## Code Architecture

The core code of the project is located in the `src` directory.

- **`src/main.ts`**: The main entry file of the application, responsible for creating the Vue application instance and mounting it.
- **`src/App.vue`**: The root component of the application, which can be used to define global styles and application-level lifecycle.
- **`src/pages/`**: Contains all the pages of the application. Each page is usually a separate directory containing `.vue` files and related static resources.
- **`src/components/`**: Stores reusable business components.
- **`src/api/`**: Encapsulates the network request module of the application, and defines the API for communicating with the backend.
- **`src/utils/`**: Stores various utility functions, such as date formatting, request encapsulation, etc.
- **`src/static/`**: Stores static resource files, such as images, fonts, etc.
- **`pages.json`**: This file is used to configure the pages of the entire application, including the page path, window style, tab bar, etc.
- **`manifest.json`**: The configuration file of the application, which contains the application's name, icon, permissions, and other multi-platform specific configurations.

## Common Commands

The project's commands are defined in `package.json` and are executed using `npm run <command>`.

- **`npm run dev:h5`**: Run the project in the browser (H5) environment for development.
- **`npm run dev:mp-weixin`**: Run the project in the WeChat Mini Program environment for development.
- **`npm run build:h5`**: Build the project for the H5 platform.
- **`npm run build:mp-weixin`**: Build the project for the WeChat Mini Program platform.
- **`npm run type-check`**: Perform a TypeScript type check on the project.
