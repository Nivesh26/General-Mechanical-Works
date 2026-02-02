const Contactusmap = () => {
  const embedUrl =
    "https://www.google.com/maps?q=Pulchowk,Lalitpur,Nepal&z=15&output=embed";

  return (
    <section
      className="w-full h-[380px] sm:h-[320px] overflow-hidden"
      aria-label="Map location: Pulchowk, Lalitpur"
    >
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Map - Pulchowk, Lalitpur"
        className="w-full h-full block"
      />
    </section>
  );
};

export default Contactusmap;
