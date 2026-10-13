# Bug fixes

## Before you run it

1. **`backend/.env` has no MongoDB password.** The URI reads `mongodb+srv://Zik:@cluster0...`, with nothing after the colon, so the backend can't connect and exits on startup. Put your Atlas DB user's password after `Zik:` and add a database name after `.net/`, e.g. `.../marketplace?retryWrites=true&w=majority`. See `backend/.env.example`.
2. **Don't run `npm test` against your real database.** The test files call `User.deleteMany({})` and similar on whatever database they connect to, and they used to connect to the real `MONGODB_URI`. They now refuse to run unless `MONGODB_TEST_URI` points at a separate database. The tests are also out of date (they call `/auth/...` instead of `/api/auth/...` and expect tokens in the response body), so they need rewriting before they'll pass.
3. `.env` files are now in `.gitignore`. Your Atlas username is already in git history, so change the DB password once you've set it.

## Frontend

| Problem | Fix |
|---|---|
| Wrong-password login spun forever with no error; logged-out page loads could hang. The 401 handler queued the `/auth/refresh` request behind itself, so it never settled. | Rewrote the interceptor in `src/lib/api.ts`. Auth endpoints never trigger a refresh, each request retries once, and login failures show "Invalid credentials". |
| Clicking "View Details" on an order showed the order list again (`/orders/$id` is a child of `/orders`, which had no `<Outlet/>`). | `orders.tsx` renders the child route when one matches. |
| The order detail page crashed (`order.paymentStatus.charAt`, a field that doesn't exist). | Shows the payment method, item names/images from `productName`/`productImage`, plus subtotal, delivery and total. |
| The wishlist never worked: the API returns `{products:[...]}`, not an array, and products have `_id`, not `id`. Hearts on the product page called `/wishlist/undefined`. `/account/wishlist` crashed. | Products and wishlist are normalized once in `apiClient.ts`. `WishlistContext` was rewritten and only loads for customers. |
| Similar-product links were broken (no `id`). | Fixed by the same normalization. |
| Delivery fee differed in three places: cart ₨299 below ₨5,000, checkout $4.99 below $50, backend 5 below 50. | All three now use ₨299, free above ₨5,000. Prices everywhere use `formatPrice` (₨). |
| The shop and filters only ever showed 10 products (backend default limit). | Shop requests up to 100. The backend now supports multi-category, brand and `minRating` filters. |
| Refreshing any `/customer/...` page bounced to `/shop` before login was checked. | Waits for the session check. |
| `/seller/pending` could redirect to itself in a loop, and suspended sellers weren't handled. | `ProtectedRoute` was rewritten. Suspended sellers see a "suspended" message. |
| The seller Reviews page crashed (`review.customer.name`; reviews have `user`). | Fixed, and the product filter works now. |
| Admin Settings: saving the profile always errored (`setUser` doesn't exist). The password minimum was 6 here but 8 on the server. | Uses `updateUser`. Minimum is 8 everywhere. |
| Customers had no way to write a review. "My Reviews" called a function that didn't exist. | Added a review form on the product page and `GET /api/reviews/me`. |
| The cart was lost on page refresh. Adding quantity N fired N toasts. | Cart is saved in localStorage. `addToCart` takes a quantity. |
| The product page re-fetched reviews and similar products every 5 s (each stock poll). | Fetches once per product. |
| Customer dashboard numbers were hard-coded (12 orders, 8 wishlist…). | Uses real orders and wishlist counts. |
| Account/seller order views read `item.name` and `shippingAddress.street` (wrong shapes). | Use `productName` and the address string. |
| Errors were toasted twice (interceptor + `handleApiError`). | `handleApiError` only logs now. |
| Admin users showed a stray "0" for sellers with no warnings. Admin orders/sellers lists stopped at 10. | Fixed. |

## Backend

| Problem | Fix |
|---|---|
| `GET /api/admin/sellers/pending` hit the `/sellers/:id` handler (id = "pending"). Same for `/api/orders/admin/all`. | Static routes are declared before `/:id`. |
| Deleting a seller didn't delete their products, and seller detail stats were always 0 (queried a non-existent `sellerId` field). | Uses `seller` / `items.seller`. Deleting a seller user also removes their products, and admins can't delete themselves. |
| Logout left the `accessToken` cookie in place, so you stayed logged in for 15 min. Logout failed once the access token had expired. | Clears both cookies and no longer needs a valid access token. |
| Deleting a cancelled order restored stock twice. An admin setting status to "cancelled" restored nothing. | Fixed. Cancelled orders can't be reopened. |
| Two simultaneous orders could oversell stock. | Conditional atomic decrement with rollback. |
| Sellers saw other sellers' items and the full order total (earnings were inflated). | Sellers get only their own items, with totals for those items. |
| Searching for text like `(` or `+` caused a 500. Malformed IDs caused 500s. | The regex is escaped. Invalid IDs return 400. |
| `originalPrice` and the seller `description` were silently dropped (not in the schemas). Product edits ignored the image and the featured/flash/best/new flags. Register ignored `storeName`. | Added to the schemas and controllers. |
| Sellers with pending, suspended or rejected accounts could still create products through the API. | Blocked. |
| Mixed-case emails could register twice or fail to log in. | Emails are lowercased. |
| Clearing the address in profile/settings was rejected. | An empty address is allowed. |
| Wishlist broke when a wishlisted product was deleted. Deleting a review of a deleted product crashed. | Null-safe. |

`GET /api/health` was added for a quick "is the API up" check.
