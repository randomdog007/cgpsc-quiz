export default function Avatar({ ini, size = 36, color, pic = null, borderColor }) {
  if (pic) {
    return (
      <img
        src={pic}
        alt="av"
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          border: `1px solid ${borderColor}`,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: `${color}15`,
        border: `1px solid ${color}44`,
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
