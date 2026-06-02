# Slot 3x3

`slot-3x3` is a small 3x3 slot game in this Web SDK workspace. It uses the
shared Svelte, Pixi, RGS request, state, layout, and sound packages from the
repo, and runs locally with the `mock-rgs` development server.

The app lives in [apps/slot-3x3](apps/slot-3x3). It follows the existing Web SDK
slot-game patterns from `apps/lines`, but keeps the implementation smaller and
focused on this game.

## Install

Use Node `22.16.0` and pnpm `10.5.0`.

```bash
pnpm install
```

## Run Locally

Use two terminals.

Terminal 1, start the mock RGS server:

```bash
pnpm run dev --filter=mock-rgs
```

Terminal 2, start the slot game:

```bash
pnpm run dev --filter=slot-3x3
```

Open the game at:

```text
http://localhost:3002
```

In dev mode, `slot-3x3` automatically adds these local RGS params if they are
missing:

```text
rgs_url=http://localhost:3100
sessionID=slot-3x3-local
```

The `slot-3x3-local` session uses mock books from:

```text
apps/mock-rgs/src/books/slot-3x3/base.json
```

## Storybook

```bash
pnpm run storybook --filter=slot-3x3
```

Open Storybook at:

```text
http://localhost:6002
```

## Build

```bash
pnpm run build --filter=slot-3x3
```

The build output is generated under:

```text
apps/slot-3x3/.svelte-kit/output
```

## Basic Game Rules

- `slot-3x3` is a 3-reel, 3-row slot.
- The current code defines 5 paylines in
  [constants.ts](apps/slot-3x3/src/game/constants.ts): top row, middle row,
  bottom row, diagonal down, and diagonal up.
- A regular line win happens when the same regular symbol appears on all 3
  reels on one payline.
- There are no 2-symbol wins because the paytable only defines 3-symbol payouts
  in [config.ts](apps/slot-3x3/src/game/config.ts).

### Paylines

| Payline | Rows      | Shape         |
| ------- | --------- | ------------- |
| 1       | `[0,0,0]` | Top row       |
| 2       | `[1,1,1]` | Middle row    |
| 3       | `[2,2,2]` | Bottom row    |
| 4       | `[0,1,2]` | Diagonal down |
| 5       | `[2,1,0]` | Diagonal up   |

```text
Payline 1          Payline 2          Payline 3
[X] [X] [X]        [ ] [ ] [ ]        [ ] [ ] [ ]
[ ] [ ] [ ]        [X] [X] [X]        [ ] [ ] [ ]
[ ] [ ] [ ]        [ ] [ ] [ ]        [X] [X] [X]

Payline 4          Payline 5
[X] [ ] [ ]        [ ] [ ] [X]
[ ] [X] [ ]        [ ] [X] [ ]
[ ] [ ] [X]        [X] [ ] [ ]
```

### Paytable

| Symbol   | Multiplier |
| -------- | ---------- |
| `HIGH_1` | 50x        |
| `HIGH_2` | 30x        |
| `HIGH_3` | 20x        |
| `HIGH_4` | 16x        |
| `LOW_1`  | 16x        |
| `LOW_2`  | 4x         |
| `LOW_3`  | 4x         |
| `LOW_4`  | 1x         |

## Hold and Spin Bonus Game Rules

- If 3 gold coins appear on the middle reel, the bonus game is triggered.
- Once the bonus starts, coins on the middle reel stay locked until the bonus
  ends.
- The bonus starts with 3 respins.
- Each new coin resets the respin counter back to 3.
- If 3 consecutive respins land no new coin, the bonus ends.
- At the end of the bonus, all visible coin values are added together as the
  payout.
