# Googology Wiki and Large-Number Naming

The Googology Wiki is a community encyclopedia devoted to large numbers. It describes itself as “an online encyclopedia and community dedicated to large numbers,” with over 44,000 articles on big-number names and concepts. In fact, “Googology” is defined on the site as “the study and nomenclature of large numbers”. Enthusiasts (called “googologists”) collect and invent number names – from standard names like googol to playful creations like nanillion or dimensoltetrexbidextetrexdex. For your purposes, the Wiki is a reference for how to systematically name or parse very large finite numbers.

Short vs. Long Scale

A key issue when reading huge numbers is choosing a naming scale. The Wiki details the two major systems:

Short scale (English/US usage):
– Million = 10^6, billion = 10^9, trillion = 10^12, quadrillion = 10^15, quintillion = 10^18, sextillion = 10^21, etc..
– In general: “n-illion” = 10^(3n+3). For example, n=1 gives million (10^6), n=2 billion (10^9), n=3 trillion (10^12), etc..

Long scale (former UK/European usage):
– Million = 10^6, milliard = 10^9, billion = 10^12, billiard = 10^15, trillion = 10^18, trilliard = 10^21, etc..
– Formula: n-illion = 10^(6n), n-illiard = 10^(6n+3). (E.g. billion (n=2) = 10^12, milliard = 10^9).

Mixing these scales causes mismatches (for instance, “billion” can mean 10^9 or 10^12). To avoid confusion, pick one consistent scale for your reader. Most modern apps use the short scale (million=10^6, billion=10^9, etc.).

Metric Prefixes

For powers of ten up to ~10^30, use standard metric prefixes as documented by the Wiki. For example:

10^3 = kilo- (k), 10^6 = mega- (M), 10^9 = giga- (G), 10^12 = tera- (T), 10^15 = peta-, 10^18 = exa-, 10^21 = zetta-, 10^24 = yotta-.

Very large official prefixes now include ronna- (10^27) and quetta- (10^30).

Using these prefixes lets your reader convert numbers (e.g. 1,000 = 1 kilo, 1,000,000 = 1 mega) in a standard way. Always attach the prefix to the base unit or number (e.g. “1 Mega” or “1 M” for 10^6) as guided by SI conventions on the Wiki.

“-illion” Naming Beyond Common Values

For named numbers beyond “trillion/quadrillion,” the Wiki explains systematic extensions. The basic “-illion” scheme (million, billion, trillion, etc.) is well-defined by the short/long rules above. Conway–Guy (Conway–Wechsler) algorithm: for n up to 999 you can form names by combining Latin roots (un-, duo-, tre-, etc.) with tens/hundreds prefixes and “-illion.” For example, the Wiki shows constructing the 234th -illion:

“234-th -illion number is named as “quattuor” + “triginta” + “ducenti” + “llion” = quattuortrigintaducentillion..

Thus you could implement code to break a large illion-index into hundreds/tens/units and concatenate those parts as described on the Wiki. (The Wiki gives full tables and rules for these Latin components.) In practice, you’ll rarely need to go that far in a game, but the information is there for any systematic extension beyond “googol-” names.

Besides “-illion” names, the Wiki lists other suffixes (like -plex for power prefixes) and even silly ones (-sy, -gong, etc.). Unless your game specifically uses those, focus on the standard parts.

Hyper-Operations and Notations

For truly astronomical values, Googology uses notation systems rather than names. Important concepts from the Wiki:

Tetration: repeated exponentiation. Defined by ^y x = x^(x^(…)) with y copies of x. The Wiki plainly states that “tetration is repeated exponentiation.”. In applications, tetration is written in Knuth’s up-arrow notation as x ↑↑ y.

Chained arrow (Conway–Guy) notation: a generalization of Knuth’s arrows. The Wiki notes it “is a generalization of up-arrow notation”. For example, tetration can also be written as x → y → 2 in chained-arrow form.

Other notations: Bird’s array notation, Bowers’ exploding array, fast-growing hierarchy (FGH), etc. These are covered in the Wiki’s Functions and Notations sections. They let one write expressions like 3 ↑↑↑ 3 or specialized bracket forms.

If your game uses notations (like 3↑3 or arrow-counts), you’ll treat those as fixed syntax rather than spoken numbers. But it’s good to know these systems exist; you could, for example, recognize that x ↑↑ y means x tetrated to y (repeated exponentiation) and handle it accordingly.

The Infinity Concept

Crucially, the Wiki emphasizes that “infinity” itself is not a finite number to read. As it says, infinity is a concept (bigger than any number) and “not a valid ‘largest number’” to googologists. In other words, you cannot parse or “read” an actual infinite value. If your Roblox game ever returns “∞” or “infinite,” your app should treat that as a special case (for example, displaying the infinity symbol or some message). Googologists instead focus on extremely large finite values and how to notate them.

The Wiki also mentions that ordinal/cardi-nal infinities are used mathematically for growth rates, but these are abstract and not directly read out as game values. The only other relevant term is something like Bowers’ whimsical “Infinity Scraper” (anything larger than a tridecillion) – essentially a joke term for “very, very big number,” not something to algorithmically expand.

Putting It Together: Implementation Tips

To build your own “infinite number reader”:

Use the Wiki’s conventions as a guide. For example, treat 10^6 as “million,” 10^9 as “billion,” etc., per the short scale. If your other engine was using long-scale names, convert them consistently.

Apply metric prefixes for intermediate values (e.g. 1,500,000 = “1.5 mega” or “1.5 M”).

Generate extended names algorithmically if needed. The Wiki’s rules let you write code to combine Latin roots for any n-illion.

Handle huge notation properly. If the game uses arrow or other notation, either parse it symbolically or convert it to a name if possible (e.g. 3 ↑↑ 3 = 3^(3^3) = 3^27 = 7,625,597,484,987). The Wiki describes these operations so you know what they mean.

Decide on a cutoff. In practice, games don’t actually display truly infinite quantities, so you can limit your reader to some maximum finite exponent or depth. Beyond that, it’s common to just show “∞” or the notation itself.

By referencing the Googology Wiki’s pages on names, prefixes, and notations, you can ensure your app’s number-reading rules match established conventions. The Wiki is continually updated (with ~44,000 articles as of late 2025), so it reflects the community’s current practices. Using its guidelines will help unify the two engines and avoid mismatches in naming huge values. Just remember: finite numbers have names; true infinity does not (aside from the infinity symbol).

Sources: Key information is drawn from the Googology Wiki (Googology Wiki main page and related articles on large-number naming, prefix/suffix conventions, hyper-operations, and infinity). These pages explain the nomenclature and concepts that will guide your implementation.
