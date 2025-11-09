import React from 'react';

const iconProps = {
  className: "w-6 h-6",
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};

const iconPropsThin = { ...iconProps, strokeWidth: 1.5 };


export const HubIcon: React.FC = () => (
  <svg {...iconProps} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

export const CoachIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);

export const ExploreIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);

export const ProfileIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} strokeWidth={2} className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const BellIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
);

export const WalletIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m14.25 6.75v-1.5a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 15v1.5m14.25 0A2.25 2.25 0 0018.75 18v.75A2.25 2.25 0 0116.5 21h-9A2.25 2.25 0 015.25 18.75V18A2.25 2.25 0 003 16.5v-1.5" /></svg>
);

export const CrystalBallIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3 3 0 100-6 3 3 0 000 6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75L18 18M18 6l-2.25 2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 18l2.25-2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.25L6 6" /></svg>
);

export const PathIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
);

export const CashFlowIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
);

export const ImageIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5a1.5 1.5 0 001.5 1.5z" /></svg>
);

export const NewsIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" /></svg>
);

export const ChartIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v16.5h16.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 19.5v-15a1.5 1.5 0 011.5-1.5h15" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12.75l3-3 3 3 3.75-3.75" /></svg>
);

export const AjoIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.14 5.454A3 3 0 006 18.72m0 0a9.094 9.094 0 013.741-.479m0 0a3 3 0 014.682-2.72m-4.682 2.72a3 3 0 00-4.682 2.72m6.638-5.86a9.094 9.094 0 01-3.741.479m-3.741-.479a3 3 0 004.682 2.72M5.25 12a3 3 0 00-4.682 2.72m4.682-2.72a9.094 9.094 0 01-3.741-.479m0 0a3 3 0 014.682 2.72M12 5.25a3 3 0 00-4.682 2.72m4.682-2.72a9.094 9.094 0 01-3.741-.479m3.741.479a3 3 0 014.682 2.72M18.75 12a3 3 0 00-4.682-2.72M12 18.75a3 3 0 00-4.682-2.72m4.682 2.72a9.094 9.094 0 01-3.741.479m3.741.479a3 3 0 004.682-2.72" /></svg>
);

export const TrophyIcon: React.FC = () => (
  <svg {...iconProps} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 01-4.152-1.928M19.5 18.75h.008v.008h-.008v-.008zm-9.75 0h.008v.008h-.008v-.008zM12 15.75h.008v.008h-.008v-.008zm0 0a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V16.5a.75.75 0 01.75-.75zM4.5 18.75h-3a.75.75 0 01-.75-.75V8.25c0-.414.336-.75.75-.75h3a.75.75 0 01.75.75v9.75a.75.75 0 01-.75.75zM19.5 18.75h3a.75.75 0 00.75-.75V8.25c0-.414-.336-.75-.75-.75h-3a.75.75 0 00-.75.75v9.75c0 .414.336.75.75.75zM16.5 18.75a9.75 9.75 0 004.152-1.928M12 12.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008zM12 12.75a4.5 4.5 0 00-4.5-4.5H4.5a4.5 4.5 0 000 9h3a4.5 4.5 0 004.5-4.5zM12 12.75a4.5 4.5 0 014.5-4.5h3a4.5 4.5 0 010 9h-3a4.5 4.5 0 01-4.5-4.5z" /></svg>
);

export const UsersIcon: React.FC = () => (
  <svg {...iconProps} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.14 5.454A3 3 0 006 18.72m0 0a9.094 9.094 0 013.741-.479m0 0a3 3 0 014.682-2.72m-4.682 2.72a3 3 0 00-4.682 2.72M5.25 12a3 3 0 00-4.682 2.72m4.682-2.72a9.094 9.094 0 01-3.741-.479m0 0a3 3 0 014.682 2.72M12 5.25a3 3 0 00-4.682 2.72m4.682-2.72a9.094 9.094 0 01-3.741-.479m3.741.479a3 3 0 014.682 2.72M18.75 12a3 3 0 00-4.682-2.72M12 18.75a3 3 0 00-4.682-2.72m4.682 2.72a9.094 9.094 0 01-3.741.479m3.741.479a3 3 0 004.682-2.72" /></svg>
);

export const QuestionIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
);

export const FireIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={1.5} className="w-5 h-5 text-amber-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.62a8.983 8.983 0 013.362-3.797z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75z" /></svg>
);

export const ChevronRightIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
);

export const MessageCircleIcon: React.FC = () => (
    <svg {...iconProps} strokeWidth={1.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m2.625 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

export const BillIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
);

export const TvIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>
);

export const PowerIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" /></svg>
);

export const WifiIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.136 11.886a9 9 0 0112.728 0M2.002 8.7a12.75 12.75 0 0118 0M12 20.25h.008v.008H12v-.008z" /></svg>
);

export const HomeIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 10.5v8.25a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v4.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V10.5m-16.5 1.5l8.25-8.25 8.25 8.25" /></svg>
);

export const ClipboardListIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);

export const ListBulletIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
);

export const AdvisorIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3 3 0 100-6 3 3 0 000 6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75L18 18M18 6l-2.25 2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 18l2.25-2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.25L6 6" /></svg>
);

export const RadarIcon: React.FC = () => (
  <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3 3 0 100-6 3 3 0 000 6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75L18 18M18 6l-2.25 2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 18l2.25-2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.25L6 6" /></svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} strokeWidth={2} className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);
export const TrashIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.036-2.134H8.716c-1.126 0-2.036.954-2.036 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
);
export const BellPlusIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M12 9v6m3-3H9" /></svg>
);
export const CameraIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
);
export const ShieldIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>
);
export const DownloadIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
);
export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconPropsThin} className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
);
export const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconPropsThin} className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
);
export const PencilIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconPropsThin} className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
);
export const MedalIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 01-4.152-1.928M19.5 18.75h.008v.008h-.008v-.008zm-9.75 0h.008v.008h-.008v-.008zM12 15.75h.008v.008h-.008v-.008zm0 0a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V16.5a.75.75 0 01.75-.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM12 18.75a6 6 0 100-12 6 6 0 000 12zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
);
export const ClockIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
export const BankIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>
);
export const UserPlusIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
);
export const CheckBadgeIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.4-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.4-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.4 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.4.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
);
export const QrCodeIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5v15h15v-15h-15zM12 9h4.5m-4.5 4.5h4.5m-10.5-4.5h.008v.008H6v-.008zm0 4.5h.008v.008H6v-.008zm4.5 0h.008v.008h-.008v-.008zm0-4.5h.008v.008h-.008v-.008z" /></svg>
);
export const ShareIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg {...iconPropsThin} className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.042.586.05c1.481.073 2.924.31 4.29.743m-4.876 1.444c.195-.025.39-.042.586-.05c1.481-.073 2.924-.31 4.29-.743m0 0a2.25 2.25 0 100-2.186m0 2.186v-2.186" /></svg>
);
export const KeyIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
);
export const FingerPrintIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 12c0 2.21-1.002 4.2-2.636 5.572M16.5 6.75h2.25M9 11.25l1.5 1.5M12 15h.008v.008H12V15zm-2.25-4.5L6.75 9M18.75 10.5l-1.5-1.5" /></svg>
);
export const DevicePhoneMobileIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75A2.25 2.25 0 0015.75 1.5h-2.25m-6 0v1.5m6-1.5v1.5m-6 0h6m-6 16.5h6" /></svg>
);
export const PaletteIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.47 2.118 2.25 2.25 0 01-2.47-2.118c-.113-.028-.227-.051-.344-.074a3 3 0 00-5.78-1.128 2.25 2.25 0 01-2.47-2.118 2.25 2.25 0 012.47-2.118.062.062 0 00.046-.025 3 3 0 00-.782-5.918 2.25 2.25 0 012.118-2.47 2.25 2.25 0 012.118 2.47.062.062 0 00.046.025 3 3 0 005.918-.782 2.25 2.25 0 012.47-2.118 2.25 2.25 0 012.47 2.118c.028.113.051.227.074.344a3 3 0 001.128 5.78 2.25 2.25 0 012.118 2.47 2.25 2.25 0 01-2.118 2.47.062.062 0 00-.025.046 3 3 0 00.782 5.918 2.25 2.25 0 01-2.47 2.118 2.25 2.25 0 01-2.118-2.47c-.113-.028-.227-.051-.344-.074z" /></svg>
);
export const CpuChipIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h16.5v16.5H3.75V4.5zM21 9h2.25M21 15h2.25M3 9H.75M3 15H.75M9 21v2.25M15 21v2.25M9 3V.75M15 3V.75M7.5 9h9M7.5 15h9" /></svg>
);
export const BookOpenIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
);
export const IdCardIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
);
export const PiggyBankIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 3.75h16.5M5.25 19.5h13.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6.75v10.5A2.25 2.25 0 005.25 19.5z" /></svg>
);
export const ShoppingCartIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.087-.825l1.823-6.836A1.125 1.125 0 0018.042 6H6.125a1.125 1.125 0 00-1.087.825L2.25 3z" /></svg>
);
export const BriefcaseIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.075c0 1.3-1.05 2.325-2.325 2.325H6.075c-1.275 0-2.325-1.025-2.325-2.325V14.15M15.75 18.225l-2.175-2.175a1.125 1.125 0 00-1.59 0L9.825 18.225M12 18.225V21M12 1.5v6.525A1.125 1.125 0 0013.125 9h1.5a1.125 1.125 0 001.125-1.125V1.5m-4.5 0v6.525A1.125 1.125 0 009.375 9H12m0-7.5a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-2.25 2.25m-2.25-6.75A2.25 2.25 0 007.5 3.75v2.25a2.25 2.25 0 002.25 2.25M12 18.225v-6.75a2.25 2.25 0 00-2.25-2.25H7.5a2.25 2.25 0 00-2.25 2.25v6.75" /></svg>
);
export const RiceIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M2 12.5C2 12.5 5 10 12 10C19 10 22 12.5 22 12.5C22 12.5 19 15 12 15C5 15 2 12.5 2 12.5Z" /><path d="M10 11.5 C10 12.3284 10.8954 13 12 13 C13.1046 13 14 12.3284 14 11.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><path d="M7 11 C7 11.8284 7.89543 12.5 9 12.5 C10.1046 12.5 11 11.8284 11 11" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><path d="M13 11 C13 11.8284 13.8954 12.5 15 12.5 C16.1046 12.5 17 11.8284 17 11" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const CementIcon: React.FC = () => (
    <svg {...iconPropsThin}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l4-4 4 4-4 4-4-4zm12 0l4-4 4 4-4 4-4-4zM8 4l4 4 4-4-4-4-4 4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v-8a2 2 0 012-2h12a2 2 0 012 2v8l-4-4-4 4-4-4-4 4z" />
    </svg>
);
export const FuelIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0c-.566.058-.987.538-.987 1.106v.958m12 0c-2.667 0-5.333 0-8 0" /></svg>
);
export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconPropsThin} className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l3.181-3.183a8.25 8.25 0 00-11.664 0l3.181 3.183" /></svg>
);
export const AddMoneyIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6V4.5m0 0a48.667 48.667 0 0111.25 0c1.028 0 1.875.847 1.875 1.875v11.25c0 1.028-.847 1.875-1.875 1.875h-11.25A1.875 1.875 0 013 18V6.375c0-1.028.847-1.875 1.875-1.875h1.5M12 9v6m3-3H9" /></svg>
);
export const SendMoneyIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
);
export const GiftIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.375A3 3 0 009.75 6m3-2.625A3 3 0 0015.75 6v3.75m-3-6.375V3.75m0 2.25L15 6.375M12 18.75v-3.75m0 3.75a3 3 0 11-3-3m3 3a3 3 0 013-3m-3 3h3.75m-3.75 0h-3.75M12 18.75a3 3 0 01-3-3V6.375m3 8.625a3 3 0 003-3V6.375m-3 8.625v-3.75M9 6.375a3 3 0 013-3h1.5" /></svg>
);
export const SearchIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
);
export const ReceiptPercentIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-1.5m3 0h.008v.008H9v-.008zm3 0h.008v.008h-.008v-.008zm3 0h.008v.008h-.008v-.008zm-3 0h-1.5m6-6.75h-3m3 0h-1.5m3 0h.008v.008h-.008v-.008zM9 9.75h.008v.008H9V9.75zm3 0h.008v.008h-.008V9.75zm3 0h.008v.008h-.008V9.75z" /></svg>
);
export const ZapIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
);
export const WithdrawIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9A2.25 2.25 0 0018.75 19.5v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" /></svg>
);
export const AirtimeIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75v.008h.008v-.008h-.008v-.008h.008v.008h-.008v-.008zm0 3.75v.008h.008v-.008h-.008v-.008h.008v.008h-.008v-.008zm0 3.75v.008h.008v-.008h-.008v-.008h.008v.008h-.008v-.008zM7.5 7.5v10.5M11.25 4.5v15M15 7.5v10.5m3.75-10.5v10.5" /></svg>
);
export const DataIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18M16.5 3L21 7.5m0 0L16.5 12M21 7.5H3" /></svg>
);
export const UsdIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
export const EurIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 010 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
export const CopyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg {...iconPropsThin} className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m9.375 2.25v9.375m-8.25-11.625v12" /></svg>
);
export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconPropsThin} className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
export const BuildingOfficeIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6M9 20.25h6" /></svg>
);
export const VideoCameraIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></svg>
);
export const ChatBubbleLeftRightIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.345c-.44.041-.882.122-1.305.255a2.25 2.25 0 01-1.522 0c-.423-.133-.865-.214-1.305-.255l-3.722-.345A1.995 1.995 0 012.25 15.085v-4.286c0-.97.616-1.813 1.5-2.097m16.5 0a2.25 2.25 0 00-1.125-2.002L18.75 5.25m-16.5 0L3.75 5.25m15 0c1.076 0 2.112.316 3 0.868m-18 0c.888-.552 1.924-.868 3-.868m12 0c.875 1.474 1.5 3.208 1.5 5.093v.099c0 .874-.158 1.706-.445 2.486m-15 0A11.953 11.953 0 003 13.5v.099c0-1.885.625-3.619 1.5-5.093m12 0c.875 1.474 1.5 3.208 1.5 5.093v.099c0 .874-.158 1.706-.445 2.486m-15 0A11.953 11.953 0 003 13.5v.099c0-1.885.625-3.619 1.5-5.093" /></svg>
);
export const PhoneIcon: React.FC = () => (
    <svg {...iconPropsThin}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
);
export const InfoIcon: React.FC = () => (
  <svg {...iconPropsThin} className="w-4 h-4 text-gray-500 cursor-pointer"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
);