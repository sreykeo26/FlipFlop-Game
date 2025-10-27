from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Pre-filled leaderboard data
leaderboard = [
    {"name":"Srey Keo", "score":95, "date":"24/10/2025"},
    {"name":"Chhea Chhouy", "score":87, "date":"23/10/2025"},
    {"name":"Keun Sreykan", "score":76, "date":"22/10/2025"}
]

@app.route("/")
def index():
    return render_template("leaderboard.html", leaderboard=leaderboard)

@app.route("/add", methods=["POST"])
def add_player():
    name = request.form.get("playerName")
    score = request.form.get("playerScore")
    if name and score:
        from datetime import datetime
        leaderboard.append({
            "name": name,
            "score": int(score),
            "date": datetime.now().strftime("%d/%m/%Y")
        })
    return redirect(url_for("index"))

@app.route("/about")
def about():
    return render_template("about.html")

if __name__ == "__main__":
    app.run(debug=True)