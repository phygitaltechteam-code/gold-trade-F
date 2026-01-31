import React, {useState, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {
  MdArrowBack,
  MdLock,
  MdBackspace,
  MdCheck,
  MdOutlineCircle,
} from 'react-icons/md';

interface PinScreenProps {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

const PinScreen: React.FC<PinScreenProps> = ({
  primaryColor = '#F57F3D',
  accentColor = '#0F1535',
  backgroundColor = '#FFFFFF',
  textColor = '#0F1535',
}) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>('');

  const handleKeyPress = (key: string) => {
    setPin((prev) => {
      if (prev.length >= 6) return prev;
      return prev + key;
    });
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div
      className="font-display flex h-full flex-col overflow-hidden py-2 antialiased selection:bg-primary/20"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {/* Header */}
      <header
        className="fixed left-0 right-0 top-0 z-50 backdrop-blur-sm"
        style={{backgroundColor: `${backgroundColor}E6`}}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <button
            onClick={() => navigate({to: '/wallet/toupscreen'})}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            style={{
              color: textColor,
              backgroundColor:
                backgroundColor === '#FFFFFF'
                  ? 'transparent'
                  : 'rgba(0,0,0,0.05)',
            }}
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-8 pb-4 pt-16">
        <div className="mb-8 mt-12 flex flex-col items-center text-center">
          <div className="mb-6" style={{color: primaryColor}}>
            <MdLock className="text-5xl font-light" />
          </div>
          <h1
            className="mb-2 text-[32px] font-semibold tracking-tight"
            style={{color: textColor}}
          >
            Enter Security PIN
          </h1>
          <p className="text-sm font-medium" style={{color: `${textColor}80`}}>
            Please enter your 6-digit access code
          </p>
        </div>

        <div className="min-h-[40px] flex-1"></div>

        {/* PIN Indicators */}
        <div className="mx-auto mb-16 flex w-full max-w-[340px] justify-between gap-3 px-2">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className="flex h-12 w-full items-center justify-center border-b-2 transition-colors"
                style={{
                  borderColor: isFilled ? primaryColor : 'rgba(0,0,0,0.1)',
                }}
              >
                {isFilled && (
                  <div
                    className="animate-in zoom-in mt-4 h-2.5 w-2.5 rounded-full duration-200"
                    style={{backgroundColor: accentColor}}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Keypad */}
        <div className="mx-auto mb-6 grid w-full max-w-[320px] grid-cols-3 gap-x-6 gap-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-[32px] font-normal transition-all active:scale-95"
              style={{
                color: textColor,
                backgroundColor: 'transparent',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
              onMouseDown={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)')
              }
              onMouseUp={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')
              }
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleBackspace}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              color: `${textColor}66`,
              backgroundColor: 'transparent',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)')
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')
            }
          >
            <MdBackspace className="text-2xl" />
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-[32px] font-normal transition-all active:scale-95"
            style={{
              color: textColor,
              backgroundColor: 'transparent',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)')
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)')
            }
          >
            0
          </button>

          <button
            onClick={() =>
              navigate({to: '/wallet/processing', search: {amount: pin}})
            }
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all active:scale-95"
            style={{
              backgroundColor: primaryColor,
              color: '#FFFFFF',
              boxShadow: `${primaryColor}33 0px 10px 25px -5px`,
            }}
          >
            <MdCheck className="text-2xl" />
          </button>
        </div>

        <div className="mb-2 flex justify-center">
          <button
            className="rounded-full px-6 py-2 text-sm font-medium transition-colors"
            style={{color: `${textColor}66`}}
            onMouseOver={(e) => (e.currentTarget.style.color = textColor)}
            onMouseOut={(e) => (e.currentTarget.style.color = `${textColor}66`)}
          >
            Forgot PIN?
          </button>
        </div>
      </main>
    </div>
  );
};

export default PinScreen;
