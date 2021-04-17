# discord-schedule-messages

schedule your next announcements/messages/etc so that you can forget about it

## how to

```
$ git clone https://github.com/Venipa/discord-schedule-messages
$ cd discord-schedule-messages
$ yarn
$ yarn build
```

### commands

```
schedule add  // adds schedule by name and duration with PT format (example: 5m5s => PT5M5S)
schedule rm   // removes schedule by name
schedule ls   // lists all schedules, also shows duration until next run
schedule now  // executes schedule now, resets timer
```


### examples

```
$ yarn start
<prefix> schedule add im_still_here 1h10m30s Hey im still here
<prefix> schedule now im_still_here
<prefix> schedule rm im_still_here
<prefix> schedule ls
```
