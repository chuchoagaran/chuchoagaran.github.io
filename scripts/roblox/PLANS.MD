## Plan: Roblox High-Number Minigame

Yes, this is completely **POSSIBLE**. Since Roblox's standard `NumberValue` caps at 1.7e308 (well before even a Centillion), we will bypass the limit by using Strings and a custom math engine ported from your `scripts.js`.

**Approach & Architecture**

- Use `StringValue` instead of `IntValue` / `NumberValue` for all money storage to prevent capping out.
- Base values will be stored in scientific notation as strings (e.g., `"1.2e1500"`) in the DataStore and Leaderstats.
- We will port your `InfiniteNumberFormatter` from `templates/js/scripts.js` into a Lua `ModuleScript`.
- The Roblox leaderboard (top-right) will show the Abbviration format to save width, while the main screen UI will show the Full Word format.

**Steps**

1. **Create the Math & Formatting Module (`NumberFormatter.lua`)**
   - Port the `InfiniteNumberFormatter` class, with its tier 1 and tier 2 lists, from JavaScript to a Lua `ModuleScript`.
   - Add simple BigNum arithmetic logic (Add, Subtract, Multiply, Compare) for strings formatted as `coeff e exp`. Since you want to use the HTML file's logic over EternityNum, we will build a lightweight `(Mantissa, Exponent)` string parser to handle coin pickups and shop costs up to 10^3,000,000.

2. **Update Leaderboard & DataStore (`leaderboard.lua`)**
   - Create a `StringValue` named "Cash" inside `leaderstats` instead of an `IntValue`.
   - Update standard Datastore saving/loading to handle the string values correctly.
   - Apply the `NumberFormatter` abbreviation output (e.g. `690 NoVtTr`) to the player's leaderboard name display value by using a separate hidden string for the raw value vs the displayed value. *(requires `GetPropertyChangedSignal` on a hidden raw `StringValue`)*

3. **Implement the UI (`Starterguitext.lua`)**
   - Bind to the raw string value's `.Changed` event.
   - Run the updated value through the `NumberFormatter.lua` to get the Full Words and update the large on-screen `TextLabel` (e.g., `690 NovemVigintiTrecentillion`).

4. **Update Coin Touch (`coin's collect script.lua`)**
   - Read the player's current scientific string.
   - Run the custom `Add` function to add the coin's value.
   - Check if a multiplier from the shop is active and factor it in.
   - Set the raw `StringValue` to the new scientific string.

5. **Implement Shop System (`shopitem.lua`)**
   - **Cost Scaling**: Calculate dynamic cost strings using the math module.
   - **Purchasing**: Use the comparison function (`GreaterThanOrEqual`) to check if the player's string balance can afford the cost string.
   - **Deduction**: Use the `Subtract` function to deduct the price and increase the player's multiplier.

**Relevant files**

- `scripts/roblox/leaderboard.lua` — Change `IntValue` to `StringValue` and adjust datastore logic.
- `scripts/roblox/coin's collect script.lua` — Modify the math to use the custom script.js string algorithm.
- `scripts/roblox/Starterguitext.lua` — Connect the UI handler to display Full Text numbers.
- `scripts/roblox/shopitem.lua` — Build multiplier upgrade logic using string-math comparisons.
- `scripts/roblox/NumberFormatter.lua` — *[NEW]* The core conversion of `templates/js/scripts.js` into Lua with added string-math capability.

**Decisions**

- `scripts.js` logic is heavily utilized over external libraries like `ETERNITYNUM.LUA` to keep it clean and match your HTML version exactly.
- Display forms: Abbreviations on the top-right Roblox leaderboard (avoiding text clipping), Full Words on the custom UI.

**Further Considerations**

1. Since we can't easily sort Strings in Roblox `OrderedDataStore` (for a global top 100 players board), do you want to worry about Global Leaderboards right now, or just stick to local player saving first?
