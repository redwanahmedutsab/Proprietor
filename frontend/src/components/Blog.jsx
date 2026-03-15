export default function Blog() {
    return (
        <section className="blog">
            <h2>Latest Blog Posts</h2>

            <div className="blog-grid">
                <div className="blog-card">
                    <img src="/img/blog1.jpg"/>
                    <h3>Tips for Buying a Home</h3>
                </div>

                <div className="blog-card">
                    <img src="/img/blog2.jpg"/>
                    <h3>Single Family Homes</h3>
                </div>

                <div className="blog-card">
                    <img src="/img/blog3.jpg"/>
                    <h3>Seller Checklist</h3>
                </div>
            </div>
        </section>
    );
}