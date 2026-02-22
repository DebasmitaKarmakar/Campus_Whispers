import React, { useState } from 'react';
import { authenticateUser } from '../services/authService';
import { dbService } from '../services/dbService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [institutionalId, setInstitutionalId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanId = institutionalId.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Invalid Credential: Enter a valid campus email');
      return;
    }

    if (!cleanId) {
      setError('Required: Provide Institutional ID');
      return;
    }

    setIsLoading(true);

    try {
      const user = await authenticateUser(cleanEmail, cleanId);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Unauthorized Access: Identity not found in whitelist');
      }
    } catch (err) {
      setError('System Error: Authentication service synchronization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequesting(true);
    // Simulate administrative processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRequestSubmitted(true);
    setIsRequesting(false);
  };

  return (
    <div className="w-full max-w-2xl px-4 py-12 flex flex-col items-center">
      <div className="w-full bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,33,71,0.08)] border-2 border-slate-100/50 overflow-hidden relative">
        <div className="flex h-1.5 w-full">
          <div className="flex-1 bg-nfsu-navy"></div>
          <div className="flex-1 bg-nfsu-gold"></div>
          <div className="flex-1 bg-nfsu-maroon"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-nfsu-navy p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-institutional-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-3xl mx-auto mb-8 flex items-center justify-center p-3 shadow-2xl border-2 border-nfsu-gold/20 transform hover:scale-105 transition-all">
                 <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCADIAMgDASIAAhEBAxEB/8QAHQABAAMBAAMBAQAAAAAAAAAAAAYHCAUCAwQBCf/EAE8QAAEDBAADAggJBgsGBwAAAAECAwQABQYRBxIhEzEIFCJBUWF1sxUXMjY3QnGBkVJUdLLB0hYjJENWgpKTlKHRVWJylcLDMzVTc9Ph8P/EABsBAQACAwEBAAAAAAAAAAAAAAAEBQIDBgEH/8QAOxEAAgEDAgIFCgQEBwAAAAAAAAECAwQRBSESMUFRYXGBBhMiMjM0kaHB8BQ1sbIWctHhFSNCUlOC8f/aAAwDAQACEQMRAD8AxlSlKAUpSgFKUoBSlKAUpXtZjSH0lTLDrgB0ShBOvwoD1V9FthSblcY1vhNdrKkupZZRsDmWo6A2eg6nz14vRZTKOd2M82netqQQK7fDX6Rcb9qxveprCcsRbR7FZaRI/iS4ob1/BdX+Nj//ACVArhEkQJ8iDLb7KRGdU06jYPKtJII2Oh6g91f0RrAfEH5+5D7Uk+9VVZp1/UupSU0tuol3VvGkk4nDpXuaiynkc7UZ5xO9cyUEivx6NIYALzDrQPQFaCN/jVrlEM9VKUr0ClKUApSlAKUpQClKUApSlAKUpQClKUApWjfBiwnFMlwWbNvtjiT5LdxW0lx0HYSG2yB0PpJ/GrW+Kfhz/RK3/gr/AFqqratSo1HBxexMp2c5xUkzDlaf8DT5r379NR+pVifFPw5/olb/AMFf613sXxSxY4w+xj1pagtPKC3UsA6UQNAn7qr73VKdxRcEmiRQtJU5qTZXHhbfRSj2kz+quszcNfpFxv2rG96mty5BjloyW3/B95tyLhFSsO9k5sgKG9Hp9prh2/hZgkWWxOhYpDbfYcS406hKtoWk7BHXvBrXaajToUHTknnf5mVa2lUqKSZLqwHxB+fuQ+1JPvVVvxTK0qHMlxJPdvfWojN4V4HJlPzJWJwnHnXFOPOKSrZWo7JPXvJNadOvYWspOSzk2XNCVZJIifgn/RMj9Pe/6ajfhm/+Q47+lPfqJq7bBjtqxy2i32e3pt8QrLgab2ElR7z1+6vRlOJ2HI2o7WQ2lqchhRWyl8HySRokdawhdwV35/G2Wz2VFuj5vpP5/wBK3H8U/Dn+iVv/AAV/rT4p+HP9Erf+Cv8AWrj/ABuj/tfyIX4CfWjDlK0T4UGFYrjWF22XYbJFgPuXENrcaB2pPZrOup9IH4VnarK2uI3FPjiiLVpOlLhYpSlSDWKUpQClKUApSlAKUpQClKUBq7wPfo4uPtVfumquqqV8D36OLj7VX7pqrqri9Q95n3l7beyiKhfFezm9oxyCxLcgTX7r2MaY2opUyosuKTvXennQnYPoqaVHsvamOXTF3IttnTG4l3TKkrjthQZaDa0bOyOu1joN9AT5qWFSVO4U4vDWcfB/faZVUnDDI5NujWWY7jci6Qw1dImTRoF1iklJZfBUHE6B+QvQUB3EfZXszVuxp4t4+u+COmHItEvty+pQbcWlQDZUE95GyAa+nLcYnqzyy5BZ0FbD8+N8OMo1pQZJLUnr50glKiOuiPXX23Rm5jizYLtHtdxcgRLbJivzGkDs23HSCn62yBryiB03VrCtSTjKlLCcJvGccLafo/H1etYfM0OMsNSW+V49v9TiOwG5GCZHe+GxmJXdVIbbjtLKejDhQ8qOSSUqcTza7vSNE10sPj4PeblCvuJnxGVawtEmGjmbeAWnl7OS2s7JSeoX12fP1rvXjxu0WZTmOWVEx4S0urhMkILiVubfWnZA5+pUOuia40iBIvHEayZHFs0+2It7D6J0yaylh2WladIY5AolYB8oqPQdw3WmNw6tOeZNL0sPiWfVSUZLpyklF9bb33xk4cLW3V+vNfU+fhXFjx71nHYtBHZ39TDfUnkbCAoIGz0Tsk69dezhbEjRv4U9g0EayCS0PKJ02nl5UDZ6JGzoD017bEzOxrJMmL9muk+BdrgLjFk29pLxG0BK2nElQKFAjofkkHvr7sEtk222uc9cmksTLncpFwcjpWF9gHCOVsqHQqCQNkdNmvLurmNWXFlSUMb88JZ+GN+pinHeKxyyd+lKVSkkpDwxvmBafaqfdOVlatU+GN8wLT7VT7pysrV1uke7LvZT3vtWKUpVmRBSlKAUpSgFKUoBSlKAUpSgNXeB79HFx9qr901Vm5rlVtxG2x590alONSH+wQI6ApQVylXXZHTQqsvA9+ji4+1V+6arueEj8z7T7SPulVzdO3hc6qqNTk3v8C3jNwtuJdCPd8dGI/md6/w6P3qfHRiP5lev8Oj96qFabdecS0wy6+6o6S202VrUfQEpBJ+6vq+CL1/sG9f8tf8A3K7D+FdO6n8SD+OrF4fHRiP5lev8Oj96nx0Yj+ZXr/Do/eqj/gi9f7BvX/LX/wByvmkR5MZzspcSTFc1vkkMqaVr06UAdeun8K6d1P4j8dWNBQuLmLTAvsol3HJrfMwkd/8AWr6PjPxv82un9yn96qJxv5Mj7U/trr+jQJJIAAGySe4Aec1yOqafRtrqdKnnCx+iZ9D0PSba9sKderniec4fVJr6Fv8Axn43+bXT+5T+9T40Mb/Nrp/cp/eri2XhXJcfTFyG+i1XFTQeNqg2x+5zWUHRSXkM9GtgggKO65GU4JMtNvlXa13SLfrXDcDU1xhlxiRBUTpPjEdwBbYPXSuo+yojscLLRIhp2kznwRk8+OOzDxh56MPfoJj8aGN/m10/uU/vVIsXv0HI4Dk2AiQhpt0tKDyQlXNoHzE9OtZ+q3eCXzVmfpyv1E1Gq0oxjlGnV9HtrS2dWnnOV0kJ8Mb5gWn2qn3TlZWrVPhjfMC0+1U+6crK1dHpHuy72fPL32rFKUqzIgpSlAKUpQClKUApSlAKUpQGrvA9+ji4+1V+6arueEj8z7T7SPulVw/A9+ji4+1V+6arueEj8z7T7SPulVRWP51D+b6MtX7p4EJ8HRxxnjFa3mllDjcK4LQsd6VCG6QR6wa63C3M80uOO5Bk19zHNL2xYIUV/wCB4N2cZell5zkK1LSlS0tNgbUUgnqPNUW4O3y1Y3xHt14vj70e3IYlMPussl1bfax1thQQOp0VDuqXcOMIxd69RDg/FrLU3JlSIwl2/EpKOx7TyR2iwvSEHXXm6dNnur6FWUctyXQt8PrfwKc9XFHLM7x2+W1NrzzNIcW6WiPdE2+dcSuTALvMCy4rQJ0UkpJAPKRvrXG4wXK43i0cOLndp0ifOkYqFvSH18zjh8Zc6qPnNWHxYxC22yExYeIXEq9y3rZK5mb2/iEh9zleRzeLCWHOVxHMSrlOylQI2ANVV/FG447LRilqxi7SbvDsVkFvcmPwlRS652y17DauoGlD0/bXlBxlwuK8cfXB6cbG/kyPtT+2rE4Qh9vOGbhFsk69S4EZ6RDixY5e/lXLysKcA+S2FqBKj0BAqu8b+TI+1P7asXhOu3DIZSLl4iEORClsyp0qMObmG0pEYc7qiPqHpoE1xWsfmU/D9qPq2ifkMds7S5fzPtX6lwxWHWD8DRZSp4TPVAQ2i6uwmrjcExzJuE2S80O0c5VDswN8oKda7te+3rMmba7l2z8tCvgoNmc72sldtupW25Bfc6dslCx2iFK2R06nqT8V4jtQra6/PfVZLWIblvF0lQfg6Lb4i9F1m3Q1kvOPujYLqxvpsfk1yseusi6NXXKmUNW+xXB+G5apEZtcxNmct6iGGJrTflNpWjqSNgc4O+6tecPH3958PmVSpucHNdizvu21nbrcc5SWdn1xKVvENFtvVxtrS+duHMejoV6UocUkf5AVafBL5qzP05X6iarTK3WH8puz8VERDDsx1aBEfU8x1VsltagFKSTsgkDv7qsvgl81Zn6cr9RNUlztF4Og11t6dl8/RIT4Y3zAtPtVPunKytWqfDG+YFp9qp905WVqvdI92Xez5Xe+1YpSlWZEFKUoBSlKAUpSgFKUoBSlKA1d4Hv0cXH2qv3TVdzwkfmfafaR90quH4Hv0cXH2qv3TVdvwkfmfafaR90qqKx/OofzfRlrL3TwKXsDdpdvsFF+lSIlp7dJmux2i46GgdqCEjqVK1yg+be/NVvyLzwAMh4w45ix1rPZtfwXfUUo8yVK7Yc5A8576pKlfSZ0uN5y13FPkutu8cAUsOtuNFzaNMg4s/ytr2PKKe30rpsa6d/qqteIpxFzLpUjBVyfgF8JcZYkR1tKjL1pbYCupRscyT10Fa2dVHqV5CjwPOW+8ZOxjfyZH2p/bUsxO9O4/f490beuDSEBSH/EHwy+tpQ8pKXCDy7OuvfodNVE8a6pk69Kf2119H0VwGuPh1Co12ftR9f8mYKpo9KMllPi/dI0hbIUaTJVdbFFiTJa3UgTrXDev8wKA8oePTClhs9eo10rnZheG7EJd5ujk1q9Ib0hTqfgW9qBWAnqyDGnIGhvQ0kA95qivhG5/BgtYuc9NvSorERMlaWQo955AeXZ8/SvCRLmyWI0eTMlSGYqSiM288paWUk7IQFE8oJ6kCobuljCX33GUNCaqJznld2+Ori547Pm+R6XHHXnVvSHC486suOrP11qO1K+8kmrc4JfNWZ+nK/UTVRaPoq3eCfzVmfpyv1E1W3HqGzyiWLF96IT4Y3zAtPtVPunKytWqfDG+YFp9qp905WVqv8ASPdl3s+UXvtWKUpVmRBSlKAUpSgFKUoBSlKAUpSgNXeB79HFx9qr901Us45ttu4zbg62lYE8kBQ3/Nmon4Hv0cXH2qv3TVS7jf8ANq3/AKcfdmuQuZON7Jp9J1ugRjK4oxksr+zKf8Vi/mzP9gU8Vi/mzP8AYFe6upiWP3LKslg49aUgy5jnKFkbS0gdVOK/3Ujr6+g89SlXrN4Un8WfR529rTi5yhFJbvZf0OYm0qXAcuCLUpUJp0MuSUsEtIcI2EKV3BRHUA16PFYv5sz/AGBWp+IuJYM/g1q4b2TNrXZJsaXpphx9KhMkpTpQkJSd85JB2e5WtA9BWcMosN2xi/SbHfIhizo5HMnfMlaT8laFfWSfMftB0QRW+u69L/W349JWaZdWd+nimovfCccNx6Hy38M45EVvf8mLPi38RzA83Z+Tzd3fXNVMkpBJlPAD/fNdLJO+P9iv2Vx3EJcbUhW+VQIOjXa6LThUsoSmk3vu93zZ8/8AKStUo6nVhTk4xWNk8L1V0InKuGfFkK1/AnJFdAdpSlQOxsdQr118V6wniLZLVIu16xm+W63xuXtpEgBKEcyuVO/K31JA6Dz9atKwXm0cQcMjXTIsfx225JGKLanI8gtKn7VdFNp020t4KT2DvmJOxsaG98o4XG67fwdsMbh1bsGGKGYlmdepCWG20XN1v5IY7NSkKZSrR3vfcClJ3uRFJzUHCOe7+5Sfi7j/AJJfFlS+NSvzl7+2avbwdXHHMKuCnHFLIuShtR3/ADaKoOr68HH5kXD2mr3aKqvKelTjp7cYpbro7SRaXFWdXhnNtdrZG/DG+YFp9qp905WVq1T4Y3zAtPtVPunKytVFpHuy72YXvtWKUpVmRBSlKAUpSgFKUoBSlKAUpSgNT+Bw+FYLd4+/KbuZXr1KaR+6anPGtorxKM6B0ZnI3/WSoVTngb3lDF+vdhcWAZUdEloHzlskKA9elg/dWhcxtS73i8+2NAF9xvnY3/6qTzJ/HWvvrkdQXm7xt9h02i140qtKpLknv9fkVXw3wK555InMWy52uAqElsrM5akhfOSAE8oP5P8AmKtXCOFnEPA7pcJloyfDGZ8qJ4oXJDjpUwkqCuZKSnXN0HfsVnwgqKVjbbrauZCiPKbWD3/aCP8AKriyayRuNUaPleMLg/wwYjIYvdlfcShbxQNB5onprWvURobBHWdQ4MbL0l2ndasq6mlOolRls8xTSe2M78nvvyTwnzK2zrGpWMZRNsd0mRLjLCUOvyWFFaHi4ObZUQCT16789TnOX3ci4C4hk1yWXbpbri9aFSF9VvsgKKeY+fXInr6d+k1zLFwZ4gzpXYP2H4EiN7U/MnutoZZQOpVpKiVa9X4ivLizf7Cu3WTBMQleO2HHkrKpwPSbKVvncB7ikbV17iVHWwAaxUXCMnJYT5Lx+hslWhcVqMKU1OUHlyXJLhafLKXE8YWe3oKoyTvj/Yr9lcSSSI7hBUCEnqnvHTvHrrt5J3x/sV+yuOtaW0KWpXKlI2T6AK7zQvcKfj+5nzjyp/Nqv/X9sTWmZ2+W8xZ7NYLfcpuJNWyMq1R2catc2GQW9qWhcl9KlLPeryenf5yai/FOO4rwfbmnJW7gybfcoiMcTMtEOCG1KOnG2BGdcCkFHPveta15unx41j13x/hbAs+WjHsqiT1CSnDbpOjRnbbHcHMHW5LjqVMOK2TypBT1IHKdmuHx9x+6LsNmyOBk6r5i9vQ3b27et+Mt2xOKHktueLEtr59Adp1V8kEkHdZU4rjUcrZ8+v8A9+2ygKcrQHg7sqb4fPPkaD9yeI/qhKf2Gs/6USEtoU44ohKEJGytROgkeskgVqzB7IrG8Ptdkc0X4zH8oI7i8olS/wDM6+6qnyurxhaRpdMn8lz+eCbp8G6jl1FR+GS+E4dZI2/KXcCsD/hbUP8AqrLlXz4Y15RIyazWNte/Eoy33QPMpwgAH16QD99UNVTpcHG1jnpMbuWarFKUqwIwpSlAKUpQClKUApSlAKUpQHcwPI5WJ5dbsgiAqXEdClo3rtEHotP3pJFbtx28W+/2SJebVID8OU2HGljv9YPoIOwR5iDX89qsDhDxSvPD+YplCfHrO8vmfhLVrR/LbP1Vf5Hz+Yir1KwdzFSh6y+ZLtbjzTxLkzTmfYD8LSnbtZFNMznDzSIzh5W31flJP1Vnz76H1GopbMw4gYG0LXFmP2VCCSlt2Cye87OnFIJUD/xGp3gvETEszYSbNdW/GSNqhv6bfR/VPyvtTseupW6lLrRZeQh1o96HEhSfwPSuejWq28uGWU/gzsbTXGqSpV4KpBcs/b/TPaVQ7xn4nutlC8pJQoaI8RY6j+x1qGXm5zrxcnblc3xIlu653A0hveu7yUAJH4Vc11wPFbhzK+DfEnT/ADkNZb6+kp6pP4VCcg4ZXWIlT1mkpujY69ipIbf16h8lX2Ag1v8AxfnNpSfidBYanpfF/lwVNvsS+a+uCrMk74/2K/ZXHUkKSUnuNdrI23VSo0VLLypBWpoMhslwr2PJ5db5vVqppi/Bq+z0JkZBMbsjJ69glIek69Y3yoPqJJ9Vd7pt/b2enU5V5qPPvfpPkluzhPKWlOpq1ZQWfV/bE5Ny4rZrcpiplxdx6VIKEoLr+PQ3F8qRpI5ltlR0PSaRsvz/AC2zz8TtkSFLhXJTZlsWuyR4/OW1BSSpxpCQNED5R7h5qtuycLsItfKtVqVc3h17Se6XRv0hA0kfgamTCG2I4jx2mmGB3NNICED+qNCqq58q7eG1vSy+t4S+Cy/0KyGnyfrsrXhbwwTj0tq+5A4zJuzfWNHaPMzEP5ZV9dz0EdE+bZ61Oslvdux2xS71dXwzDiNlbivOfQkDzqJ0APOTXCzviPiOGML+GLo2qWB5MKOQ4+o+jlB8n7VED11lLi5xPvXECclDyfErSwrmjwkK2N/lrP1lf5DzDvJoOC61Wv56u9vljqX32vckzqU7aHDDn98yN5vkMvKsruF/m9HZjxWEb2EIHRKB6gkAfdXGpSukjFRSiuSKltt5YpXkptxKELUhSUr2UkjorXTp6a8a9PBSlKAUpSgFKUoBSlTbg3Y8KvmWBGfZQmw2WK2qQ9ytKU7KCAVFpsgEJUda69evQE0BZfgq8ErLxJgTMhyJV5RBtc1AVHaY5Wbi32aiplt3mB7XmCNgdySOu1Ap9yMb4S8W7hPxjCsauPDvOI5dFvgTZqno1xU3vmZX2nlMvaSencCDvmqYPXnHM6wVvOb/AHm9YHw0xm7t2zGLPjyE+MpkpSFiS6vSgFgK3vvG1aOySuybRg2P5LmVl4g5DJZkSLV4pc7ZmEBbcOPkCFK5WmJSFaCJIWEpPL8oEA8vRCQMCSmHosl2LJaW0+ystuNrGlIUDogjzEGvVUx40xcgjcU8jeyfH3bBc5twemOQV9Q2HXFLHKodFp69FDoe8VDqA/UKUhQWhRSpJ2CDog1OsX4u8QMfCG42QPymE9AzNAfTr0bV5QH2EVBKVhUpQqLE1kyjOUd4s0bi/hLgqQ1k2O6H1n7e5/21/vVdGFZvjGZRlPWC6syVoG3GDtDrf/Eg9devu9dYKr67Pcp9nubFytct2JMjq52nmlaUk/6eYjuI6Gqu40ejNZp+i/kSqd7OPrbo/oJ8HwPhkXrxKP8ACYa7ES+T+NCPRv8Ab366b1XEzbOcXw2Oly/3VqO4tO246QVvOD1IHXXrOh66r13jMBwLTl6W2he1u/B4a15AlgbKtfk8nl69YFZXu1wnXa4v3G5SnZcuQvndedVtSj/+/Cq600udaT868KO332EuveKKXDu2aCyjwlztbWM44NfVfuDn/bR+9VW5Rxbz/IUrblZA/GYV/MwgGE69G0+UR9pNQWlXtKwt6Xqx+pXTuKk+bP1SlKUVKJUonZJPUmvylKlmk/RrY2dDz1rDAWcIvV/eg8PsLxBnALHCaevuXZNalSn98gLmg8rkC1HYCAkjzjpoVTfCDhPJy6G/lWS3JvGMFtyt3C9SRoL0f/CYT3uOnu0AdE+c6Sq8OLNndzDwZbXduEtnulpwmwzHVzbNJjdm5cW0Eam842XkjqVdTo8x+pQHX408Po/GPh5i9xwmKzi0yKzLVjuKyVssC5QgsKVIZQNFtaxyq0rpojZG+ZWM7lBm2y4SLfcYj8OZGcLT7DyChxtYOilST1BHorSvHSRjHECYOMuMcW7bZ5UO2MqhWB5xTU+HIaA/iGUpIIG+ZQWka5j6DsUXxKz7JOIl8bvWUSWJM1thDHaNR0NcwSkDauUDZOtnf3aHSgItSlKAUpSgFKUoBSlKAuDwauIDdjvhwXJfgSRhGRSEIuzN4SosMkdzyVJ6oX0AB7t8pJGgpNrQLvYOMPEeFhlugt2rghhCFyJjappjNuIAWEvOrUrm0pZ6DfMElR2CTrJNTbhBxIuvDe+S5kODAutuuMYxLnbJ7fPHmMHvSoeY+g+s7BBIIGmF5BhOeX2xcEjgUu/PJuEhqW85e/HPgaOAnkchTuq1shI5+Rfo7Mg9AKnyrwfF3Ez7hweyq3Z7bojq0PQ2XEt3CPyqIPM0ddonp0UnXN3pTqpVkfF3hzj/AAMfXwxxi1YzluVKdiT2Yb7j71vig+VzOrSkgr6coSAkcxI6pr78LsnCrhziXDji38FZxMuJhF9T1mUhyG9OSShTL5UeZs7JGhpKkpPQnYIGWrrbrhap7tvukGVBmMnldjyWlNuIPoKVAEffXy1trIMquDuFYRa+JmGwMtyXN766uHaroyG3rVb3HAlDaXQgOJVtSSFHrykg/J6UH4T1k4VY3m0uwcPI98jzbdMcj3FuU8lyKnlCddiokuEhRUk85+r0oCoaVY/Cjg5lHEe0TbvaJ9gt8GJITFU9c7gGAt5Q2ltIAJ2QemwAfMeh1+ReB/FKXk18xyFicmTcrEWvH2m3mvIDoJbUklQ5woJJBTvpQEHNzk/AIs3N/JhKMrX+/wAnLv8ACvhqzPiC4yc/J8Xt63/7adfjvVdu1eDBxmmNl+Xjce0xk9VPz7gw2lI9JAUVAfdXiSXIZyUxStTY5wjsrfC2+45kPETAn4FnfF6ukuwQlXK5Rxy9n2fbApAR0JI5SQd+Y1nLEptmtWX2+fe7Ub3aY0pLkiH2pa8ZbB+TzaOt/wD1XoPXiWPXfK8jg47YYol3Oc52UdkuJb51aJ1zKISOgPea1Bwk4eWjhRkd2sWR3vBXuJcy3NOWNm7qU5ChuKX5Ta1EAdqtJRykde8DY3vtWm9ReOPC2+2O4XXBLZKuk1DWF4/tMaTbwy5tY5kp2Frb0BoEEk+YlI5PG2bBn49j3FjEbJKN14b3RFiu0G/Nh1/lZKexckBs6Ol9OYK6lff0oCweIWD27J+OePJzDJMTj4TZYraE44bu2wjx8pJ7MMADoVqT39Snp3HVRnj7xCybAZXD3KLkzbrPmkZyREm43Dn9rBXbSrSQtGylHMAkBX3/AFAE4/yy+T8mye55FdFpXNuUpyU+U75eZaiogb7gN6A9AFdvh3nP8DnZ7ysRxXJHJaUBKr9AMrxcp5urY5gATzdd7B5U+igLR8JPB+GVuxdebYMLlBTOyJ6HDYdWhUScwhvmdfiAJBDKHfIB2Qd9OmtZ/qQ57mmS5zehd8muS5shDYZZQEpbajtD5LbbaQEoSPQB6zskmo9QClKUApSlAKUpQClKUApSlAKnvC/i3nnDxKoeN5LPgWyQ6FyorYbcSodAooDqVJQsga5gN9B6KgVKA1Bj/F7Gc08KJ3ibkcwWyy2C0Ors0OevTji22iENdCRzqWtxY69+h1NZqvNwlXa7zbrNX2kqbIckPK/KWtRUo/iTXyUoC/LLguNYUrCMuu+L3fiFiOT2ltTrMYrb8VuJcAWgdkfKUjSkhJI5iVDzGr8vqrTZeIfGfIZc25vZXasad8VUylDUKNAdYQY7QSDz9ulSTsnQIOx39MgcPOLvEfh/b37diOUy7dCfUVrjltt5sKPepKXEqCSemynROh6K8LVxPyqDa8xhOvs3BzMGm2rpLmBTkghCioFC+YaJ2QdgjXmGhQGicIw3ibmHgcojx7k83Pm5H4/CkTLsWyuGGg2drKug5wrSSevfrqN+HGLFomR+Ffw5w/LZi/g6bY4KZqEyDyPLQHvICgfrqQE8w6+V061UPAC23bidfoHDW+ZLeRicFt+6G1xnuZTpbSVFthCunaKKjr0bUe8mvh8IHOpOYZbaJrGLTcUaslvbtcJl55anghhauRRUpKSFjm0ddxHfQGgsBz25XPjTd+Cd2wSx4Tj12hz7cxAjW0MOK/i19m4tf85tKVaUkAK5tjffWOH2pdnvDjLqA1MgyClSVJCglxCtEEEaOiO411sjzfLciv0a/wB5yG4S7tFYQwzNU6Q8hCd8oCxo78o9e87OzXAWpS1qWtRUpR2pROyT6aA0ND478O3b5Gz+8cJWn+IMUJWmXGnqahPSEjSZCmR3KGgdaOyN73oimrtnGVXKVkTz16ltIySV41dmGHVIakr51LHMkHRAKjoHuqOUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKA+u0XK4Wi5x7napsiDOjLDjEiO4UONqHcUqHUGu7n/ELMs9XBXl9+kXdUFCkRi8lALYVrm+SBvfKOp33UpQEXpSlAKUpQClKUApSlAKUpQClKUB//9k=" alt="NFSU Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-4">
                Campus<br/><span className="text-nfsu-gold">Whispers</span>
              </h2>
              <div className="w-12 h-1 bg-nfsu-gold mx-auto mb-6"></div>
              <p className="text-nfsu-gold/60 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                Central Authority<br/>Authentication Terminal
              </p>
            </div>
          </div>

          <div className="p-10 lg:p-14 bg-white">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-nfsu-navy transition-colors">
                    University Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-5 rounded-2xl bg-[#FFFBEB] border-2 border-amber-100/50 focus:border-nfsu-navy focus:bg-white outline-none transition-all font-bold text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder-slate-300"
                    placeholder="name@nfsu.ac.in"
                    disabled={isLoading}
                  />
                </div>

                <div className="group">
                  <label htmlFor="institutionalId" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-nfsu-maroon transition-colors">
                    Institutional ID
                  </label>
                  <input
                    id="institutionalId"
                    type="text"
                    value={institutionalId}
                    onChange={(e) => setInstitutionalId(e.target.value)}
                    className="w-full px-6 py-5 rounded-2xl bg-[#FFFBEB] border-2 border-amber-100/50 focus:border-nfsu-maroon focus:bg-white outline-none transition-all font-mono font-black tracking-[0.3em] text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] uppercase placeholder-slate-300"
                    placeholder="ID NUMBER"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="space-y-3">
                  <div className="bg-red-50 border-l-4 border-nfsu-maroon p-4 rounded-r-2xl animate-shake">
                    <p className="text-[9px] text-nfsu-maroon font-black uppercase tracking-tight">{error}</p>
                  </div>
                  {error.includes('whitelist') && (
                    <button 
                      type="button" 
                      onClick={() => dbService.clearData()}
                      className="text-[9px] font-black text-nfsu-navy underline decoration-nfsu-gold uppercase block text-center w-full"
                    >
                      Troubleshoot: Clear & Re-seed Whitelist
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full py-6 bg-nfsu-navy text-white font-black rounded-2xl shadow-xl overflow-hidden transition-all hover:bg-nfsu-maroon disabled:opacity-50 uppercase tracking-[0.25em] text-[10px] border-b-4 border-black/20"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isLoading ? 'Verifying...' : 'Authorize Entry'}
                    {!isLoading && <span className="text-nfsu-gold">→</span>}
                  </span>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-nfsu-navy transition-colors"
                >
                  Request Institutional Access
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Institutional Access Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 max-w-lg w-full shadow-2xl border-4 border-nfsu-gold animate-slideUp relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -rotate-12 translate-x-12 -translate-y-12 flex items-center justify-center opacity-40">
               <span className="text-[10px] font-black text-nfsu-navy">REQU</span>
            </div>

            {requestSubmitted ? (
              <div className="text-center py-10 space-y-8">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-nfsu-navy uppercase italic tracking-tighter">Request Logged</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4 leading-relaxed max-w-xs mx-auto">
                    Institutional enrollment request submitted to registry. Reference ID: <span className="text-nfsu-gold">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  </p>
                </div>
                <button 
                  onClick={() => { setShowRequestModal(false); setRequestSubmitted(false); }}
                  className="w-full py-5 bg-nfsu-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl border-b-4 border-black/20"
                >
                  Return to Hub
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-nfsu-navy uppercase italic tracking-tighter">Enrollment Desk</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">Identity Binding & Whitelist Authority</p>
                </div>

                <form onSubmit={handleRequestSubmission} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Email</label>
                    <input required type="email" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-black focus:border-nfsu-navy outline-none transition-all uppercase" placeholder="NAME@NFSU.AC.IN" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Access</label>
                    <textarea required className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-bold h-24 outline-none focus:border-nfsu-gold transition-all uppercase" placeholder="SPECIFY DEPARTMENT AND ENROLLMENT YEAR..."></textarea>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-xl text-[10px] uppercase tracking-widest border-b-4 border-slate-200"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      disabled={isRequesting}
                      className="flex-2 py-4 bg-nfsu-navy text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl border-b-4 border-black/20"
                    >
                      {isRequesting ? 'Verifying...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};