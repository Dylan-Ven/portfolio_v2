# Portfolio v2 - Terminal Edition

A modern, interactive terminal-style portfolio built with Next.js 15, React 19, and TypeScript. Experience a unique command-line interface that showcases projects, skills, and contact information.

![Portfolio Screenshot](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## 🚀 Features

- **Interactive Terminal UI** - Full-featured command-line interface
- **15 Color Themes** - From classic green to cyberpunk neon
- **Live Discord Status** - Real-time activity via Lanyard API
- **Particle Effects** - Visual feedback on command execution
- **CRT Screen Effect** - Optional retro screen aesthetic
- **Mobile Optimized** - Responsive design with mobile-specific ASCII art
- **Command History** - Navigate previous commands with arrow keys
- **Persistent Settings** - Saves preferences to localStorage
- **Vercel Analytics** - Built-in analytics integration

## 🎮 Commands

### Navigation Commands
```bash
help           # Show all available commands
clear          # Clear terminal output
home           # Go to home section
about          # View about section
projects       # View projects
contact        # View contact information
back           # Return to previous section
```

### Section Numbers
When in any section, type a number (1-9) to access subsections:

**Home Section:**
- `1` - About section
- `2` - Projects section
- `3` - Contact section

**About Section:**
- `1` - Biography
- `2` - Technical skills with progress bars
- `3` - Frameworks & libraries
- `4` - Work experience

**Projects Section:**
- `1-3` - View individual project details

**Contact Section:**
- `1-5` - Copy contact information to clipboard

### Quick Commands
```bash
ls             # Alias for 'projects'
cd <section>   # Navigate to section (e.g., cd about)
cd ..          # Alias for 'back'
tree           # Display directory structure
```

### Contact Commands
Available in the contact section:
```bash
github         # Open GitHub profile
linkedin       # Open LinkedIn profile
email          # Open email client
instagram      # Open Instagram profile
```

### Customization Commands
```bash
typing on/off        # Toggle typing animation effect
sound on/off         # Toggle terminal sound effects
crt on/off           # Toggle CRT screen effect
theme <name>         # Change color theme
themes               # List all available themes
prompt set <text>    # Set custom prompt
prompt reset         # Reset prompt to default
```

### Utility Commands
```bash
npm install resume   # Download resume PDF
npm i resume         # Download resume (shorthand)
stats                # Show session statistics
debug on/off         # Toggle debug mode
```

## 🎨 Available Themes

Type `themes` to see all options, or use `theme <name>` to switch:

1. **default** - Modern blue terminal
2. **green** - Classic green terminal
3. **amber** - Warm amber terminal
4. **dracula** - Dracula color scheme
5. **monokai** - Monokai color scheme
6. **nord** - Nord color scheme
7. **high-contrast** - WCAG AAA accessibility
8. **solarized-dark** - Solarized Dark
9. **solarized-light** - Solarized Light
10. **gruvbox** - Gruvbox retro theme
11. **tokyo-night** - Tokyo Night theme
12. **one-dark** - One Dark theme
13. **synthwave** - Synthwave 80s neon
14. **matrix** - Matrix green code
15. **cyberpunk** - Cyberpunk 2077 style

Example: `theme tokyo-night`

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **UI:** React 19
- **Language:** TypeScript 5
- **Styling:** CSS with CSS Variables for theming
- **API:** Lanyard (Discord activity)
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel

## 🌐 Live Demo

Visit the live portfolio: [www.dylanvdven.xyz](https://www.dylanvdven.xyz/)

## 🎯 Key Features Explained

### Command History
- Use **↑** and **↓** arrow keys to navigate command history
- History persists across sessions

### Syntax Highlighting
- Commands are color-coded
- Success/error messages have distinct colors
- URLs and emails are highlighted
- Skill levels have color gradients

### Live Discord Status
- Integrates with Lanyard API
- Shows current activity (gaming, music, etc.)
- Updates every 30 seconds
- Displays online status

### Session Statistics
Type `stats` to view:
- Session duration
- Commands executed
- Sections visited
- Most used command
- Command history size

### Debug Mode
Type `debug on` to see:
- React state variables
- LocalStorage contents
- Browser information
- Performance metrics

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio!

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Dylan Van Der Ven**
- Portfolio: [Your Portfolio URL]
- GitHub: [@Dylan-Ven](https://github.com/Dylan-Ven)
- LinkedIn: [Dylan Van Der Ven](https://www.linkedin.com/in/dylan-van-der-ven-766a94240/)

## 🙏 Acknowledgments

- Inspired by classic terminal interfaces
- Discord status powered by [Lanyard](https://github.com/Phineas/lanyard)
- CRT effects inspired by retro computing

---

**Tip:** Start by typing `help` in the terminal to see all available commands!