export default function Avatar({ ini, size = 36, color, pic = null, borderColor }) {
  if (pic) {
    return (
      <img
        src={pic}
        alt="av"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1px solid ${borderColor}`,
          objectFit: "cover",
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        border: `1px solid ${color}33`,
        boxShadow: `0 2px 8px ${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.4,
        color,
        flexShrink: 0,
      }}
    >
      {ini}
    </div>
  );
}
