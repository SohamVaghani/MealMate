import os
path = "e:/MealMate/frontend/src/pages/AdminDashboard.jsx"
with open(path, "r", encoding="utf-8") as f:
    orig = f.read()
repl = orig.replace('<span className="font-black text-slate-400 pl-1">$</span>', 
                     '<span className="font-black text-slate-400 pl-1">₹</span>')
repl = repl.replace("fi.price.replace('$', '')", "fi.price.replace('₹', '')")
with open(path, "w", encoding="utf-8") as f:
    f.write(repl)

path = "e:/MealMate/frontend/src/pages/RestaurantDashboard.jsx"
with open(path, "r", encoding="utf-8") as f:
    orig = f.read()
repl = orig.replace("'<span style=\"color:#10b981;\">-$' + discount.toFixed(2)", 
                     "'<span style=\"color:#10b981;\">-₹' + discount.toFixed(2)")
with open(path, "w", encoding="utf-8") as f:
    f.write(repl)

path = "e:/MealMate/frontend/src/pages/UserDashboard.jsx"
with open(path, "r", encoding="utf-8") as f:
    orig = f.read()
repl = orig.replace('<span className="text-indigo-200 opacity-60 mr-1">$</span>', 
                     '<span className="text-indigo-200 opacity-60 mr-1">₹</span>')
with open(path, "w", encoding="utf-8") as f:
    f.write(repl)
