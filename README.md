# beno.

A personal website following the approved five-stage storyboard. All visible props and the 14 named portraits are newly illustrated transparent PNG artwork. The mockup screenshot is not used by the website.

## Start

Double-click start-website.cmd on Windows and keep the terminal window open. Open the Local URL printed in the terminal (normally http://127.0.0.1:4173). If it is occupied, a free nearby port is used. The launcher locates an existing Node installation or the bundled Codex runtime.

## Edit the site in Excel

The authoritative workbook is content/site-content.xlsx. Open it, edit a row, save, and refresh the local website. The server detects changed workbooks and regenerates content/site.json. Do not edit JSON separately: the workbook replaces it on the next workbook update.

- Essays: set featured=TRUE on exactly one visible row. That essay appears first in On my table lately. Surprise Me picks from the visible archive rows.
- Books, Films, Albums: edit titles, notes, status, URLs and covers; visibility and order control what appears. Put a cover URL or an assets/books/filename.jpg path in cover. Empty covers use a typeset fallback.
- Writing: your latest three Substack posts are prefilled. Site writing_source=feed uses the latest public RSS posts; change it to sheet to curate the Writing rows yourself.
- Projects: change descriptions, two project sections, and links.
- Socials: edit actual profile links. Substack is filled; no other profile addresses are invented.
- Illustrations: toggle individual named characters. The Benolin row is disabled until a reference photo is supplied. Image, column and row select an illustration from the original portrait PNG atlases; atlas=FALSE accepts a standalone PNG.

If using the separately downloaded sheet, replace content/site-content.xlsx inside this extracted website folder. Editing a second copy elsewhere will not affect the running website. The Read me tab explains each setting.

## Substack

Connected to https://windowwatch.substack.com/ through its public RSS feed, with direct links to real posts and More on Substack. The local server refreshes the feed on use, with a 15 minute cache and a last-good snapshot when offline. No Substack login is needed. A static deployed build shows the snapshot from its latest build, not a continuously updating server.

## Build and publish

Run node scripts/check.mjs and node scripts/build.mjs. The static output is dist/. This website has not been pushed to the user's GitHub account. The Excel compiler and RSS fetch use Node built-ins; the workbook authoring and fixture-test scripts are developer utilities that use the local runtime packages. They are not needed to edit the workbook or run the site.

## Artwork

Original transparent illustrations: shuttered/open windows, computer, typewriter, open book, davara, floating books and media. Named portrait pool: Richard Dawkins, Christopher Hitchens, Kaber Vasuki, Friedrich Hayek, Adam Smith, Leto II Atreides, Charles Darwin, Isaac Newton, Albert Einstein, Niels Bohr, Amit Varma, Ilaiyaraaja, Mahatma Gandhi and Jawaharlal Nehru. Portrait likenesses are illustrations and can be individually replaced from the sheet. Benolin needs a reference photo. The paper tear uses a separate vector layer with irregular fibres.

## Validation

Content and syntax checks pass. A live workbook edit was tested: changing the featured essay and hiding a book updated the running site; original content was restored. Browser checks cover the illustrated desk, real Substack links, named portraits, project pages and the media shelf. Review the artwork and final copy before public launch.

## Current visual refinements

Illustrations use a selective greyscale render filter that retains blue; coffee is the sole brown illustration accent. The off-white paper and torn blue paper use separate textures. Both window states share exact bounds (145 x 155 desktop; 115 x 123 mobile). The reveal has one personality at lower left; Elsewhere has two. Other lower sections retain one. The blue strip is one scrollable Books / Films / Albums recommendation shelf, populated from the corresponding workbook rows. Actual cover files are included for the three starting books. Add your own recommendation in note; use cover for future jacket/poster files or URLs. Blank Socials URLs appear as inactive placeholders; adding a URL activates the link.

## Latest palette and spacing

The computer screen is blue. The table is green with its existing wood grain. Paper is lighter while retaining the same texture. Personality drawings are about 17-20% smaller and desk props about 10% smaller. The window uses a plain frame and simple folding shutters around the existing sky/book/teapot artwork; the frame keeps the same size in both states. Book recommendation notes remain editable in the workbook.

## Coffee interaction

Hover over the coffee or focus it with the keyboard to show hand-drawn steam. Click, tap, Enter or Space starts a 4.2-second burst; repeated activation renews it. Reduced-motion preferences show still steam lines. The markup is in index.html, its styling in theme.css and the timed click behaviour in app.js.

## Projects subtitle and album visibility

Edit projects_subtitle in the Site tab of content/site-content.xlsx to change the line beneath the Projects section heading. Albums must have visible=TRUE to appear; a cover image is optional, and local cover paths begin with assets/albums/. Save this workbook and refresh the site started with start-website.cmd. A static server serving dist cannot compile Excel edits: run node scripts/build.mjs again before previewing or publishing dist.
