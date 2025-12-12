"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
export default function ContactPage() {

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative py-24">
        <div className="absolute inset-0">
          <img 
            src="/ImgPoster/h1-banner01-1.jpg"
            alt="Contact Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-center font-bold text-6xl text-white drop-shadow-lg">
            Liên Hệ
          </h1>
        </div>
      </div>

      <div className="bg-white" style={{ height: '90px' }}></div>

      <div className="flex relative -mt-6">
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-3/4 -translate-y-1/2 text-white p-6 rounded-lg shadow-lg max-w-xs z-20" style={{ marginLeft: '-25px', backgroundColor: '#1fa8be' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-lg" style={{ color: '#1fa8be' }}>📍</span>
            </div>
            <h3 className="text-xl font-bold">Vị Trí</h3>
          </div>
          <p className="text-sm italic mb-3">đến đây để gặp chúng tôi !</p>
          <div className="space-y-1 text-sm">
            <p>00 Quang Trung, phường 11</p>
            <p>Gò Vấp, TP.HCM</p>
            <p>Việt Nam</p>
          </div>
        </div>

        
        <div className="w-1/2 relative min-h-screen hidden lg:block">
           
           <iframe
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.858169091077!2d106.68427047481882!3d10.822164158349184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528e54969507f%3A0xea73b2e1d95100ba!2zQ8O0bmcgdHkgQ-G7lSBwaOG6p24gUGhần mềm FPT!5e0!3m2!1svi!2s!4v1710000000000!5m2!1svi!2s"
             width="100%"
             height="100%"
             style={{ border: 0 }}
             allowFullScreen
             loading="lazy"
             referrerPolicy="no-referrer-when-downgrade"
             className="absolute inset-0"
           />
           
            
        </div>

        
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12 relative min-h-screen">
          
          <div className="absolute inset-0">
            <Image
              src="/ImgPoster/4efadc2852a6a8e3c147a8f46743968c.jpg"
              alt="Contact Background"
              fill
              className="object-cover"
            />
          </div>

          <div className="max-w-md relative z-10 mx-auto w-full p-6 md:p-8 rounded-3xl shadow-xl border border-white/30 bg-white/60 backdrop-blur-md">
            <div className="space-y-2 mb-4">
              <h1 className="text-4xl font-bold text-green-900">Liên Hệ Với Chúng Tôi!</h1>
              <p className="text-green-700 italic">Hãy liên lạc với chúng tôi !</p>
              <p className="text-sm text-green-700">
                Nhập thông tin của bạn vào đây để gửi yêu cầu trực tiếp đến địa chỉ email của chúng tôi.
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        placeholder="Họ tên*"
                        className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-none bg-white/70"
                    />
                </div>
                
                <div>
                    <Input
                        placeholder="Điện thoại*"
                        className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-none bg-white/70"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        placeholder="Địa chỉ"
                        className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-none bg-white/70"
                    />
                </div>
                <div>
                    <Input
                        placeholder="Email*"
                        type="email"
                        className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-none bg-white/70"
                    />
                </div>
              </div>

              <div>
                <Input
                    placeholder="Chủ đề*"
                    className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-none bg-white/70"
                />
              </div>

              <div>
                <textarea
                    placeholder="Nội dung*"
                    rows={4}
                    className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-none resize-none bg-white/70"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 disabled:opacity-70 shadow-sm"
              >
                Gửi Tin Nhắn
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-green-800 mb-1">
                <span className="font-semibold">Điện thoại :</span> <span className="font-semibold text-green-700">0786012569</span>
              </p>
              <p className="text-green-800">
                <span className="font-semibold">Email :</span>{" "}
                <a href="mailto:duchaunguyen131@gmail.com" className="hover:underline font-semibold text-green-700" style={{ textUnderlineOffset: '3px' }}>
                  duchaunguyen131@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}