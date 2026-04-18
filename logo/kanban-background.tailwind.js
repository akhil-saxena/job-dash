// tailwind.config.js — extend with JobDash kanban tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        ink:   '#292524',
        cream: '#f5f3f0',
        amber: { DEFAULT: '#f59e0b', deep: '#d97706' },
      },
      backgroundImage: {
        'kanban': `
          radial-gradient(circle at 100% 100%, transparent 199px, rgba(245,158,11,0.10) 200px 201px, transparent 202px),
          radial-gradient(circle at 100% 100%, transparent 339px, rgba(245,158,11,0.09) 340px 341px, transparent 342px),
          radial-gradient(circle at 100% 100%, transparent 479px, rgba(245,158,11,0.08) 480px 481px, transparent 482px),
          radial-gradient(circle at 100% 100%, transparent 619px, rgba(245,158,11,0.07) 620px 621px, transparent 622px),
          radial-gradient(circle at 100% 100%, transparent 759px, rgba(245,158,11,0.06) 760px 761px, transparent 762px),
          radial-gradient(circle at 100% 100%, transparent 899px, rgba(245,158,11,0.05) 900px 901px, transparent 902px),
          radial-gradient(circle, rgba(41,37,36,0.13) 1px, transparent 1.2px)
        `,
      },
      backgroundSize: {
        'kanban': '100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 16px 16px',
      },
    },
  },
};

/* Usage in JSX:
   <div className="bg-cream bg-kanban [background-size:theme(backgroundSize.kanban)]">
     ...columns
   </div>
*/
