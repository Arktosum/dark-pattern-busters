console.log("Hey");

let seen = new Set();
setInterval(()=>{
    const reviews = document.querySelectorAll("[id^=customer_review-]");
    for(let review of reviews){
        let review_id = review.id.split("-")[1];
        if(seen.has(review_id)) continue;
        seen.add(review_id);
        review.children[0].innerHTML += "<div>Misdirection</div>"
        reviewText = review.children[4].textContent.trim();
        // console.log(reviewText);
    }
},1000)


