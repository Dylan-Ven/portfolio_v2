# Terminal Commands

Each file in this directory handles one logical group of terminal commands.
They export a handler function that receives terminal state/actions and returns
the output string(s) to display.

## Planned structure

```
commands/
  navigation.ts      # home, about, projects, contact, back, cd, ls
  about.ts           # bio, skills, frameworks, experience
  projects.ts        # major, minor, project detail view
  contact.ts         # github, linkedin, email, instagram, copy
  system.ts          # help, clear, stats, neofetch, tree, debug, prompt
  themes.ts          # theme, themes
  preferences.ts     # typing on/off, sound on/off, crt on/off
  games.ts           # tetris, snake
  easter-eggs.ts     # matrix, hack, coffee, sudo, whoami, ping, fortune, joke, secret, git push, npm install resume
  index.ts           # barrel — re-exports all handlers
```
